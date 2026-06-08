import { isProd } from "@/lib/env.common";
import { INTERNAL_REFRESH_SECRET } from "@/lib/env.server";
import { NextRequest, NextResponse } from "next/server";
import { MiddlewareAuthCheckPreset, MiddlewareTokenRefreshPreset, Role } from "@/lib/auth/types";

const callInternalTokenRefresh = async (nextRequest: NextRequest, role: Role) => {
	return fetch(`${nextRequest.nextUrl.origin}/api/internal/token-refresh`, {
		method: "POST",
		headers: {
			cookie: nextRequest.headers.get("cookie") ?? "",
			"x-internal-refresh-secret": INTERNAL_REFRESH_SECRET,
			"x-auth-role": role,
		},
		cache: "no-store",
	});
};

const applySetCookies = (source: Response, target: NextResponse) => {
	for (const cookie of source.headers.getSetCookie?.() ?? []) {
		target.headers.append("Set-Cookie", cookie);
	}
};

/**
 * 모든 요청에 대해 토큰 검증 및 재발급 처리
 */
export const handleTokenRefresh = async <R extends Role>(
	nextRequest: NextRequest,
	preset: MiddlewareTokenRefreshPreset<R>,
): Promise<{ response: NextResponse; newAccessToken?: string; newRefreshToken?: string }> => {
	const accessToken = nextRequest.cookies.get(preset.aToken)?.value || nextRequest.headers.get(preset.aToken);
	const refreshToken = nextRequest.cookies.get(preset.rToken)?.value || nextRequest.headers.get(preset.rToken);

	// 1) accessToken 유효 → 그대로 통과
	if (accessToken?.trim()) {
		try {
			await preset.verifyATokenForMiddleware(accessToken);
			return { response: NextResponse.next() };
		} catch {
			console.warn(`[Middleware TokenRefresh:${preset.role}] ${preset.aToken} 만료됨`);
		}
	}

	// 2) refreshToken 없음 → 그대로 통과 (로그인 페이지에서만 체크)
	if (!refreshToken?.trim()) {
		return { response: NextResponse.next() };
	}

	// 3) refreshToken 검증
	try {
		await preset.verifyRTokenForMiddleware(refreshToken);
	} catch {
		console.error(`[Middleware TokenRefresh:${preset.role}] ${preset.rToken} 만료됨`);
		return { response: NextResponse.next() };
	}

	// 4) Node API로 위임하여 refresh 로직·Lock·캐시를 API와 공유
	try {
		console.log(`[Middleware TokenRefresh:${preset.role}] 내부 refresh API 호출 =>`, {
			beforeToken: "..." + refreshToken.slice(-10),
		});

		const internalRes = await callInternalTokenRefresh(nextRequest, preset.role);

		if (internalRes.status === 401 || internalRes.status === 403) {
			const response = NextResponse.next();
			response.cookies.set(preset.aToken, "", {
				path: "/",
				httpOnly: true,
				secure: isProd,
				sameSite: "strict",
				maxAge: 0,
			});
			response.cookies.set(preset.rToken, "", {
				path: "/",
				httpOnly: true,
				secure: isProd,
				sameSite: "strict",
				maxAge: 0,
			});
			return { response };
		}

		if (!internalRes.ok) {
			console.error(`[Middleware TokenRefresh:${preset.role}] 내부 refresh API 실패`, internalRes.status);
			return { response: NextResponse.next() };
		}

		const body = (await internalRes.json().catch(() => ({ refreshed: false }))) as { refreshed?: boolean };
		if (!body.refreshed) {
			return { response: NextResponse.next() };
		}

		const response = NextResponse.next();
		applySetCookies(internalRes, response);

		console.log(`[Middleware TokenRefresh:${preset.role}] 토큰 쿠키 재설정 완료 (내부 API)`);

		return { response };
	} catch (err: unknown) {
		console.error(`[Middleware TokenRefresh:${preset.role}] 내부 refresh API 호출 중 오류`, err);
		return { response: NextResponse.next() };
	}
};

/**
 * 로그인 페이지로 리다이렉트
 */
const redirectToLogin = <R extends Role>(nextRequest: NextRequest, message: string, preset: MiddlewareAuthCheckPreset<R>): NextResponse => {
	const pathname = nextRequest.nextUrl.pathname;
	const search = nextRequest.nextUrl.search;
	const returnUrl = encodeURIComponent(pathname + search);
	const loginUrl = `${preset.loginUrl}?message=${message}&returnUrl=${returnUrl}`;

	const response = NextResponse.redirect(new URL(loginUrl, nextRequest.url));

	response.cookies.set(preset.aToken, "", {
		path: "/",
		httpOnly: true,
		secure: isProd,
		sameSite: "strict",
		maxAge: 0,
	});
	response.cookies.set(preset.rToken, "", {
		path: "/",
		httpOnly: true,
		secure: isProd,
		sameSite: "strict",
		maxAge: 0,
	});
	return response;
};

/**
 * 인증 필요 페이지 처리 - 토큰검사 후 로그인 페이지로 리다이렉트 처리
 * @param baseResponse - 토큰 재발급이 이미 적용된 response (쿠키 유지를 위해 필수)
 */
export const handleAuthCheck = async <R extends Role>(
	nextRequest: NextRequest,
	baseResponse: NextResponse,
	preset: MiddlewareAuthCheckPreset<R>,
): Promise<NextResponse> => {
	const accessToken = nextRequest.cookies.get(preset.aToken)?.value || nextRequest.headers.get(preset.aToken);
	const refreshToken = nextRequest.cookies.get(preset.rToken)?.value || nextRequest.headers.get(preset.rToken);

	console.log(`[Middleware AuthCheck:${preset.role}] 인증 필요 페이지 처리 url: ${nextRequest.url}`, {
		[preset.aToken]: accessToken ? "..." + accessToken.slice(-10) : "없음",
		[preset.rToken]: refreshToken ? "..." + refreshToken.slice(-10) : "없음",
	});

	if (!refreshToken?.trim()) {
		console.log(`[Middleware AuthCheck:${preset.role}] ${preset.rToken} 없음 → 로그인 페이지로 리다이렉트`);
		return redirectToLogin(nextRequest, "need_login", preset);
	}

	try {
		await preset.verifyRTokenForMiddleware(refreshToken);
	} catch {
		console.error(`[Middleware AuthCheck:${preset.role}] ${preset.rToken} 만료 → 로그인 페이지로 리다이렉트`);
		return redirectToLogin(nextRequest, "need_login", preset);
	}

	if (accessToken?.trim()) {
		try {
			await preset.verifyATokenForMiddleware(accessToken);
		} catch {
			console.warn(`[Middleware AuthCheck:${preset.role}] ${preset.aToken} 만료 - ${preset.rToken} 유효하므로 baseResponse로 통과 / 확인 필요`);
		}
		return baseResponse;
	}

	console.log(`[Middleware AuthCheck:${preset.role}] ${preset.rToken} 유효 - ${preset.aToken} 없음 - ${preset.rToken} 유효하므로 통과 / 확인 필요`);
	return baseResponse;
};
