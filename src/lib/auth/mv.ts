import { postUrlFormData } from "@/api/fetchFilter";
import { BaseResponse } from "@/types/common";
import { getBackendUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { ACCESS_TOKEN_COOKIE_AGE, REFRESH_TOKEN_COOKIE_AGE } from "@/lib/auth/utils/tokenTime";
import { isProd } from "@/lib/env";
import { toErrorResponse } from "@/api/error";
import {
	generateAccessTokenForMiddleware,
	generateRefreshTokenForMiddleware,
	verifyAccessTokenForMiddleware,
	verifyRefreshTokenForMiddleware,
} from "@/lib/auth/utils/token";
import { NextRequest, NextResponse } from "next/server";
import { MiddlewarePolicy } from "@/lib/mv/policy.type";
import { tokenRefreshLock } from "@/lib/auth/utils/lock";
import { MiddlewareAuthCheckPreset } from "@/lib/auth/types";

/**
 * Middleware에서 사용할 토큰 재발급 함수
 */
const refreshAccessToken = async (nextRequest: NextRequest, refreshToken: string) => {
	const newRefreshToken = await generateRefreshTokenForMiddleware();
	const xffHeader = nextRequest.headers.get("x-forwarded-for");
	const ip = xffHeader?.split(",")[0]?.trim() ?? nextRequest.headers.get("x-real-ip") ?? "unknown";

	try {
		console.log(
			"[Middleware TokenRefresh] 토큰 재생성 시작 => beforeToken:",
			refreshToken.slice(-10) + "...",
			"newRefreshToken:",
			newRefreshToken.slice(-10) + "...	",
		);
		const reTokenData = await postUrlFormData<BaseResponse & { userNo: number }>(
			getBackendUrl(API_URL.AUTH_TOKEN_REFRESH),
			{
				beforeToken: refreshToken,
				refreshToken: newRefreshToken,
			},
			{
				userAgent: nextRequest.headers.get("user-agent") || "",
				["x-forwarded-for"]: ip,
			},
		);
		console.log("[Middleware TokenRefresh] 토큰 재생성 완료", reTokenData);

		const newAccessToken = await generateAccessTokenForMiddleware({ userNo: reTokenData.userNo });
		console.log("[Middleware TokenRefresh] 토큰 재생성 완료");

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
export const handleTokenRefresh = async (
	nextRequest: NextRequest,
	policy: MiddlewarePolicy,
): Promise<{ response: NextResponse; newAccessToken?: string; newRefreshToken?: string }> => {
	const accessToken = nextRequest.cookies.get(policy.cookies.access)?.value || nextRequest.headers.get(policy.cookies.access);
	const refreshToken = nextRequest.cookies.get(policy.cookies.refresh)?.value || nextRequest.headers.get(policy.cookies.refresh);

	// 1) accessToken 유효 → 그대로 통과
	if (accessToken?.trim()) {
		try {
			await policy.verifyAccessToken(accessToken);
			console.log(`[Middleware] ${policy.cookies.access} 유효`);
			return { response: NextResponse.next() };
		} catch {
			console.warn(`[Middleware] ${policy.cookies.access} 만료됨`);
		}
	}

	// 2) refreshToken 없음 → 그대로 통과 (로그인 페이지에서만 체크)
	if (!refreshToken?.trim()) {
		return { response: NextResponse.next() };
	}

	// 3) refreshToken 검증
	try {
		await verifyRefreshTokenForMiddleware(refreshToken);
		console.log(`[Middleware] ${policy.cookies.refresh} 유효`);
	} catch {
		console.error(`[Middleware] ${policy.cookies.refresh} 만료됨`);
		return { response: NextResponse.next() };
	}

	// 4) accessToken 없음 → ✅ Lock을 사용하여 중복 갱신 방지 (토큰 재발급)
	// 새 탭 동시 열기 등으로 refreshToken이 유효한 상태에서 여러 요청이 동시에 들어올 수 있기 때문에, Lock을 사용하여 하나의 요청만 토큰 재발급을 수행하도록 함.
	const lockKey = `mw-refresh:${refreshToken.slice(-10)}`;

	const result = await tokenRefreshLock.acquireOrWait(lockKey, async () => {
		console.log(`[Middleware TokenLock] 토큰 갱신 시작: ${lockKey}`);
		return refreshAccessToken(nextRequest, refreshToken);
	});

	if (result.success) {
		const response = NextResponse.next();
		response.cookies.set("accessToken", result.newAccessToken!, {
			httpOnly: true,
			secure: isProd,
			sameSite: "strict",
			path: "/",
			maxAge: ACCESS_TOKEN_COOKIE_AGE,
		});
		response.cookies.set("refreshToken", result.newRefreshToken!, {
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
		response.cookies.set("accessToken", "", {
			path: "/",
			httpOnly: true,
			secure: isProd,
			sameSite: "strict",
			maxAge: 0,
		});

		response.cookies.set("refreshToken", "", {
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
const redirectToLogin = (nextRequest: NextRequest, message: string): NextResponse => {
	const pathname = nextRequest.nextUrl.pathname;
	const search = nextRequest.nextUrl.search;
	const returnUrl = encodeURIComponent(pathname + search);
	const loginUrl = `/user?message=${message}&returnUrl=${returnUrl}`;

	const response = NextResponse.redirect(new URL(loginUrl, nextRequest.url));

	// ✅ 쿠키 확실히 만료(옵션 일치)
	response.cookies.set("accessToken", "", {
		path: "/",
		httpOnly: true,
		secure: isProd,
		sameSite: "strict",
		maxAge: 0,
	});

	response.cookies.set("refreshToken", "", {
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
export const handleAuthCheck = async (nextRequest: NextRequest, baseResponse: NextResponse, preset: MiddlewareAuthCheckPreset) => {
	console.log("[Middleware AuthCheck] 로그인 인증이 필요한 url", nextRequest.url);

	const accessToken = nextRequest.cookies.get("accessToken")?.value || nextRequest.headers.get("accessToken");
	const refreshToken = nextRequest.cookies.get("refreshToken")?.value || nextRequest.headers.get("refreshToken");

	console.log(
		"[Middleware AuthCheck] 토큰 확인",
		"accessToken",
		accessToken ? accessToken.substring(0, 10) + "..." : "없음",
		"refreshToken",
		refreshToken ? refreshToken.substring(0, 10) + "..." : "없음",
	);

	// 1) refreshToken 없음 → 로그인 페이지로 리다이렉트
	if (!refreshToken?.trim()) {
		console.log("[Middleware AuthCheck] refreshToken 없음 → 로그인 페이지로 리다이렉트");
		return redirectToLogin(nextRequest, "need_login");
	}

	// 2) refreshToken 검증
	try {
		await verifyRefreshTokenForMiddleware(refreshToken);
		console.log("[Middleware AuthCheck] refreshToken 유효");
	} catch {
		console.error("[Middleware AuthCheck] refreshToken 만료 → 로그인 페이지로 리다이렉트");
		return redirectToLogin(nextRequest, "need_login");
	}

	// 여기부터는 refreshToken이 "존재 + 유효"인 상태
	// 4) accessToken 유효 → 그실패해도 페이지 접근은 허용 (API에서 최종 권한 확인)
	if (accessToken?.trim()) {
		try {
			await verifyAccessTokenForMiddleware(accessToken);
			console.log("[Middleware AuthCheck] accessToken 유효 - 통과");
		} catch {
			console.warn("[Middleware AuthCheck] accessToken 만료됨 - refreshToken 유효하므로 baseResponse로 통과");
		}
		return baseResponse;
	}
	// 5) refreshToken 유효 → 페이지 접근은 허용 (accessToken 없음/미확인 다음 요청에서 반영/재발급될 수 있음, baseResponse로 통과)
	console.log("[Middleware AuthCheck] refreshToken 유효 - accessToken 없음 - refreshToken 유효하므로 통과");
	return baseResponse;
};
