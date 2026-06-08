// src/middleware.ts or /middleware.ts
import { adminHandleAuthCheck, adminHandleTokenRefresh } from "@/lib/auth/admin";
import { sellerHandleAuthCheck, sellerHandleTokenRefresh } from "@/lib/auth/seller";
import { userHandleAuthCheck, userHandleTokenRefresh } from "@/lib/auth/user";
import { MIDDLEWARE_TOKEN_REFRESH_ENABLED } from "@/lib/env.server";
import { isAuthRequiredPath } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

const resolveTokenRefreshResponse = async (
	nextRequest: NextRequest,
	refresh: (request: NextRequest) => Promise<{ response: NextResponse }>,
): Promise<NextResponse> => {
	if (!MIDDLEWARE_TOKEN_REFRESH_ENABLED) {
		return NextResponse.next();
	}

	const { response } = await refresh(nextRequest);
	return response;
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

	// middleware상태확인
	// console.log("[Middleware]", pathname, nextRequest.url, nextRequest.method, "================================");

	// 개발자 도구나 브라우저 내부 요청 필터링
	// if (pathname.startsWith("/.well-known/") || pathname.startsWith("/favicon.")) {
	// 	return NextResponse.next();
	// }
	// ex) /mypage/wish
	// console.log("API요청아닌거 어서오고", "pathname", pathname, "===============================");

	// 1) 유저 ------------------------------------
	if (!pathname.startsWith("/seller") && !pathname.startsWith("/admin")) {
		// 1) 로그인이 필요한 페이지는 추가 인증 체크
		const needsAuth = isAuthRequiredPath(pathname);
		// 로그인이 필요한 페이지가 아니면 그냥 통과
		if (!needsAuth) {
			return NextResponse.next();
		}

		const baseResponse = await resolveTokenRefreshResponse(nextRequest, userHandleTokenRefresh);
		return userHandleAuthCheck(nextRequest, baseResponse);
	}
	// 2) 판매자 ------------------------------------
	if (pathname.startsWith("/seller")) {
		// console.log("[Middleware] 판매자 페이지 접근");
		if (["/seller/login", "/seller/join"].some((v) => pathname.startsWith(v))) {
			return NextResponse.next();
		}

		const baseResponse = await resolveTokenRefreshResponse(nextRequest, sellerHandleTokenRefresh);
		return sellerHandleAuthCheck(nextRequest, baseResponse);
	}
	// 3) 관리자 ------------------------------------
	if (pathname.startsWith("/admin")) {
		// console.log("[Middleware] 관리자 페이지 접근");
		if (pathname.startsWith("/admin/login")) {
			return NextResponse.next();
		}

		const baseResponse = await resolveTokenRefreshResponse(nextRequest, adminHandleTokenRefresh);
		return adminHandleAuthCheck(nextRequest, baseResponse);
	}
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
