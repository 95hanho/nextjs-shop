import { postUrlFormData } from "@/api/fetchFilter";
import { BaseResponse } from "@/types/common";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { REFRESH_TOKEN_COOKIE_AGE } from "@/lib/auth/utils/tokenTime";
import { isProd } from "@/lib/env";
import { toErrorResponse } from "@/api/error";
import { NextRequest, NextResponse } from "next/server";
import { tokenRefreshLock } from "@/lib/auth/utils/lock";
import { KeyOf, MiddlewareAuthCheckPreset, MiddlewareTokenRefreshPreset, Role } from "@/lib/auth/types";

/**
 * Middleware에서 사용할 토큰 재발급 함수
 */
const refreshAccessToken = async <R extends Role>(nextRequest: NextRequest, refreshToken: string, preset: MiddlewareTokenRefreshPreset<R>) => {
	const newRefreshToken = await preset.generateRTokenForMiddleware();
	const xffHeader = nextRequest.headers.get("x-forwarded-for");
	const ip = xffHeader?.split(",")[0]?.trim() ?? nextRequest.headers.get("x-real-ip") ?? "unknown";

	try {
		console.log(
			`[Middleware TokenRefresh:${preset.role}] 토큰 재생성 시작 => beforeToken: ${refreshToken.slice(-10)}..., newRefreshToken: ${newRefreshToken.slice(-10)}|...`,
		);
		const reTokenData = await postUrlFormData<BaseResponse & { [key in typeof preset.primaryKey]: number }>(
			getBackendUrl(preset.reTokenApiUrl),
			{
				beforeToken: refreshToken,
				refreshToken: newRefreshToken,
			},
			{
				userAgent: nextRequest.headers.get("user-agent") || "",
				["x-forwarded-for"]: ip,
			},
		);
		console.log(`[Middleware TokenRefresh:${preset.role}] 토큰 재생성 완료`, reTokenData);

		const primaryKey = preset.primaryKey as KeyOf<R, "primaryKey">;
		const aTokenPayload = {
			[primaryKey]: reTokenData[primaryKey],
		} as Record<KeyOf<R, "primaryKey">, number>;

		const newAccessToken = await preset.generateATokenForMiddleware(aTokenPayload);
		console.log(`[Middleware TokenRefresh:${preset.role}] 토큰 재생성 완료`, {
			newAccessToken: newAccessToken.slice(-10) + "...",
			newRefreshToken: newRefreshToken.slice(-10) + "...",
		});

		return {
			success: true,
			newAccessToken,
			newRefreshToken,
		};
	} catch (err: unknown) {
		const { status } = toErrorResponse(err);

		// 토큰 자체가 문제인 케이스(예시)
		if (status === 401 || status === 403) {
			return { success: false, invalidateCookies: true };
		}

		// 일시 장애로 보고 유지
		return { success: false, invalidateCookies: false };
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
			console.log(`[Middleware TokenRefresh:${preset.role}] ${preset.aToken} 유효`);
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
		console.log(`[Middleware TokenRefresh:${preset.role}] ${preset.rToken} 유효`);
	} catch {
		console.error(`[Middleware TokenRefresh:${preset.role}] ${preset.rToken} 만료됨`);
		return { response: NextResponse.next() };
	}

	// 4) accessToken 없음 → ✅ Lock을 사용하여 중복 갱신 방지 (토큰 재발급)
	// 새 탭 동시 열기 등으로 refreshToken이 유효한 상태에서 여러 요청이 동시에 들어올 수 있기 때문에, Lock을 사용하여 하나의 요청만 토큰 재발급을 수행하도록 함.
	const lockKey = `mw-refresh:${preset.role}:${refreshToken.slice(-10)}`;

	const result = await tokenRefreshLock.acquireOrWait(lockKey, async () => {
		console.log(`[Middleware TokenLock:${preset.role}] 토큰 갱신 시작: ${lockKey}`);
		return refreshAccessToken(nextRequest, refreshToken, preset);
	});

	if (result.success) {
		const response = NextResponse.next();
		response.cookies.set(preset.aToken, result.newAccessToken!, {
			httpOnly: true,
			secure: isProd,
			sameSite: "strict",
			path: "/",
			maxAge: preset.aTokenCookieAge,
		});
		response.cookies.set(preset.rToken, result.newRefreshToken!, {
			httpOnly: true,
			secure: isProd,
			sameSite: "strict",
			path: "/",
			maxAge: REFRESH_TOKEN_COOKIE_AGE,
		});
		return {
			response,
			// newAccessToken: result.newAccessToken,
			// newRefreshToken: result.newRefreshToken,
		};
	}

	const response = NextResponse.next();

	if (result.invalidateCookies) {
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
	}

	return { response };
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

	// ✅ 쿠키 확실히 만료(옵션 일치)
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
	console.log(`[Middleware AuthCheck:${preset.role}] 로그인 인증이 필요한 url: ${nextRequest.url}`);

	const accessToken = nextRequest.cookies.get(preset.aToken)?.value || nextRequest.headers.get(preset.aToken);
	const refreshToken = nextRequest.cookies.get(preset.rToken)?.value || nextRequest.headers.get(preset.rToken);

	console.log(
		`[Middleware AuthCheck:${preset.role}] 토큰 확인 ${preset.aToken}: ${accessToken ? accessToken.substring(0, 10) + "..." : "없음"}, ${preset.rToken}: ${refreshToken ? refreshToken.substring(0, 10) + "..." : "없음"}`,
	);

	// 1) refreshToken 없음 → 로그인 페이지로 리다이렉트
	if (!refreshToken?.trim()) {
		console.log(`[Middleware AuthCheck:${preset.role}] ${preset.rToken} 없음 → 로그인 페이지로 리다이렉트`);
		return redirectToLogin(nextRequest, "need_login", preset);
	}

	// 2) refreshToken 검증
	try {
		await preset.verifyRTokenForMiddleware(refreshToken);
		console.log(`[Middleware AuthCheck:${preset.role}] ${preset.rToken} 유효`);
	} catch {
		console.error(`[Middleware AuthCheck:${preset.role}] ${preset.rToken} 만료 → 로그인 페이지로 리다이렉트`);
		return redirectToLogin(nextRequest, "need_login", preset);
	}

	// 여기부터는 refreshToken이 "존재 + 유효"인 상태
	// 4) accessToken 유효 → 그실패해도 페이지 접근은 허용 (API에서 최종 권한 확인)
	if (accessToken?.trim()) {
		try {
			await preset.verifyATokenForMiddleware(accessToken);
			console.log(`[Middleware AuthCheck:${preset.role}] ${preset.aToken} 유효 - 통과`);
		} catch {
			console.warn(`[Middleware AuthCheck:${preset.role}] ${preset.aToken} 만료됨 - ${preset.rToken} 유효하므로 baseResponse로 통과`);
		}
		return baseResponse;
	}
	// 5) refreshToken 유효 → 페이지 접근은 허용 (accessToken 없음/미확인 다음 요청에서 반영/재발급될 수 있음, baseResponse로 통과)
	console.log(`[Middleware AuthCheck:${preset.role}] ${preset.rToken} 유효 - ${preset.aToken} 없음 - ${preset.rToken} 유효하므로 통과`);
	return baseResponse;
};
