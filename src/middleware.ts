// src/middleware.ts or /middleware.ts
import { NextRequest, NextResponse } from "next/server";
import {
	generateAccessTokenForMiddleware,
	generateRefreshTokenForMiddleware,
	verifyAccessTokeForMiddleware,
	verifyRefreshTokenForMiddleware,
} from "./lib/jwt";
import { isAuthRequiredPath } from "./utils/auth";
import { postUrlFormData } from "@/api/fetchFilter";
import { BaseResponse } from "@/types/common";
import { getBackendUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { ACCESS_TOKEN_COOKIE_AGE, REFRESH_TOKEN_COOKIE_AGE } from "@/lib/tokenTime";
import { isProd } from "@/lib/env";
import { tokenRefreshLock } from "@/lib/auth";
import { toErrorResponse } from "@/api/error";

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
const handleTokenRefresh = async (
	nextRequest: NextRequest,
): Promise<{ response: NextResponse; newAccessToken?: string; newRefreshToken?: string }> => {
	const accessToken = nextRequest.cookies.get("accessToken")?.value || nextRequest.headers.get("accessToken");
	const refreshToken = nextRequest.cookies.get("refreshToken")?.value || nextRequest.headers.get("refreshToken");

	// 1) accessToken 유효 → 그대로 통과
	if (accessToken?.trim()) {
		try {
			await verifyAccessTokeForMiddleware(accessToken);
			console.log("[Middleware] accessToken 유효");
			return { response: NextResponse.next() };
		} catch {
			console.warn("[Middleware] accessToken 만료됨");
		}
	}

	// 2) refreshToken 없음 → 그대로 통과 (로그인 페이지에서만 체크)
	if (!refreshToken?.trim()) {
		return { response: NextResponse.next() };
	}

	// 3) refreshToken 검증
	try {
		await verifyRefreshTokenForMiddleware(refreshToken);
		console.log("[Middleware] refreshToken 유효");
	} catch {
		console.error("[Middleware] refreshToken 만료됨");
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
 * 로그인 인증 체크
 * @param baseResponse - 토큰 재발급이 이미 적용된 response (쿠키 유지를 위해 필수)
 */
const handleAuthCheck = async (nextRequest: NextRequest, baseResponse: NextResponse) => {
	console.log("[Middleware] 로그인 인증이 필요한 url", nextRequest.url);

	const accessToken = nextRequest.cookies.get("accessToken")?.value || nextRequest.headers.get("accessToken");
	const refreshToken = nextRequest.cookies.get("refreshToken")?.value || nextRequest.headers.get("refreshToken");

	console.log(
		"[Middleware] 토큰 확인",
		"accessToken",
		accessToken ? accessToken.substring(0, 10) + "..." : "없음",
		"refreshToken",
		refreshToken ? refreshToken.substring(0, 10) + "..." : "없음",
	);

	// 1) refreshToken 없음 → 로그인 페이지로 리다이렉트
	if (!refreshToken?.trim()) {
		console.log("[Middleware] refreshToken 없음 → 로그인 페이지로 리다이렉트");
		return redirectToLogin(nextRequest, "need_login");
	}

	// 2) refreshToken 검증
	try {
		await verifyRefreshTokenForMiddleware(refreshToken);
		console.log("[Middleware] refreshToken 유효");
	} catch {
		console.error("[Middleware] refreshToken 만료 → 로그인 페이지로 리다이렉트");
		return redirectToLogin(nextRequest, "need_login");
	}

	// 여기부터는 refreshToken이 "존재 + 유효"인 상태
	// 4) accessToken 유효 → 그실패해도 페이지 접근은 허용 (API에서 최종 권한 확인)
	if (accessToken?.trim()) {
		try {
			await verifyAccessTokeForMiddleware(accessToken);
			console.log("[Middleware] accessToken 유효 - 통과");
		} catch {
			console.warn("[Middleware] accessToken 만료됨 - refreshToken 유효하므로 baseResponse로 통과");
		}
		return baseResponse;
	}
	// 5) refreshToken 유효 → 페이지 접근은 허용 (accessToken 없음/미확인 다음 요청에서 반영/재발급될 수 있음, baseResponse로 통과)
	console.log("[Middleware] refreshToken 유효 - accessToken 없음 - refreshToken 유효하므로 통과");
	return baseResponse;
};

/**
 * middleware는 Edge Runtime에서 동작
 * nextRequest.url : 도메인+쿼리 포함 path
 * nextRequest.nextUrl.pathname : 쿼리 제외 path
 * nextRequest.nextUrl.search : 쿼리
 * nextRequest.nextUrl.searchParams : 쿼리스트링을 URLSearchParams 객체
 */
export async function middleware(nextRequest: NextRequest) {
	const pathname = nextRequest.nextUrl.pathname;
	// const isApi = pathname.startsWith("/api");

	// middleware상태확인
	console.log("[Middleware]", pathname, nextRequest.url, nextRequest.method, "================================");

	// api는 withAuth로 개별적으로 체크하기 때문에, 여기서는 페이지 이동 요청에 대해서만 체크하도록 함.
	// if (isApi) {
	// 	return NextResponse.next();
	// }
	// 이미 로그아웃이면 아무것도 안함.
	// if (searchParams.get("logout") === "1") return NextResponse.next();
	// return NextResponse.next();
	// 개발자 도구나 브라우저 내부 요청 필터링
	// if (pathname.startsWith("/.well-known/") || pathname.startsWith("/favicon.")) {
	// 	return NextResponse.next();
	// }
	// ex) /mypage/wish
	// console.log("API요청아닌거 어서오고", "pathname", pathname, "===============================");

	// 1) ✅ 모든 요청에 대해 토큰 재발급 먼저 처리
	const { response: tokenResponse } = await handleTokenRefresh(nextRequest);

	// 2) 로그인이 필요한 페이지는 추가 인증 체크
	const needsAuth = isAuthRequiredPath(pathname);
	if (!needsAuth) {
		return tokenResponse;
	}

	// 3) ✅ 토큰 재발급이 적용된 response를 전달하여 쿠키 유지
	return handleAuthCheck(nextRequest, tokenResponse);
}

export const config = {
	// matcher: ["/board/:path*"],
	//  => board로 시작하는 경로는 모두 미들웨어 적용 (게시판 관련 페이지는 모두 로그인 필요하도록)
	// matcher: ['/((?!_next|favicon.ico|api|static).*)'],
	//  => _next, static, api 등은 제외 (정적 리소스 요청 제외)
	// matcher: ["/((?!_next|favicon.ico|static).*)"],
	//  => _next, static, favicon 등은 제외 (정적 리소스 요청 제외)
	// matcher: ["/((?!_next|favicon.ico|api/public|static).*)"],
	//  => _next, static, api/public 등은 제외 (정적 리소스 요청 제외, api/public은 인증 필요 없는 api로 예외처리)
	// matcher: ["/((?!_next|favicon.ico|favicon\\.|static|api|\\.well-known/).*)"],
	//  => _next, static, api, favicon, .well-known 등은 미들웨어 진입 전에 제외
	// matcher: ["/((?!_next|favicon.ico|favicon\\.|static|api|images|public|\\.well-known/).*)"],
	// => _next, static, api, favicon, images, public, .well-known 등은 미들웨어 진입 전에 제외 (정적 리소스 요청 제외, api는 인증 필요 없는 api로 예외처리)
	matcher: ["/((?!_next|static|api|.*\\..*).*)"],
	// => 파일 확장자가 있는 모든 요청 제외 (이미지, css, js 등)
	// => 페이지 요청만 통과
	// api/public : 인증요청 필요없는 api => 수정해야함
};
