// src/middleware.ts or /middleware.ts
import { handleAuthCheck, handleTokenRefresh } from "@/lib/mv";
import { isAuthRequiredPath } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

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
	console.log("[Middleware]", pathname, nextRequest.url, nextRequest.method, "================================");

	// 개발자 도구나 브라우저 내부 요청 필터링
	// if (pathname.startsWith("/.well-known/") || pathname.startsWith("/favicon.")) {
	// 	return NextResponse.next();
	// }
	// ex) /mypage/wish
	// console.log("API요청아닌거 어서오고", "pathname", pathname, "===============================");

	// 1) 유저 ------------------------------------
	if (!pathname.startsWith("/seller") && !pathname.startsWith("/admin")) {
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
	// 2) 판매자 ------------------------------------
	if (pathname.startsWith("/seller")) {
		console.log("판매자 페이지 접근");
		return NextResponse.next();
	}
	// 3) 관리자 ------------------------------------
	if (pathname.startsWith("/admin")) {
		console.log("관리자 페이지 접근");
		return NextResponse.next();
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
