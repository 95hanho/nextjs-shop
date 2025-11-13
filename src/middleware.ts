// src/middleware.ts or /middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { addLogoutQuery } from "./lib/auth";
import { middleware_verifyToken } from "./lib/jwt";
import { isAuthRequiredPath } from "./utils/auth";
import { cookies } from "next/headers";

// async function logoutRedirect(nextRequest: NextRequest) {
// 	const response = NextResponse.redirect(new URL("/login?message=need_login", nextRequest.url));
// 	response.cookies.delete("accessToken");
// 	response.cookies.delete("refreshToken");
// 	return response;
// }

const handleAuthCheck = async (nextRequest: NextRequest, isApi: boolean) => {
	// ------- 로그인 인증이 필요한 url
	console.log("로그인 인증이 필요한 url");

	const rToken = nextRequest.headers.get("refreshToken") || nextRequest.cookies.get("refreshToken")?.value;
	const aToken = nextRequest.headers.get("accessToken") || nextRequest.cookies.get("accessToken")?.value;
	// const rToken = nextRequest.cookies.get("refreshToken");
	if (!rToken) {
		console.error("no rToken ===> 로그아웃 쿼리 추가하여서 리다이렉트");
		// 로그아웃 쿼리 추가하여서 리다이렉트
		const logoutUrl = addLogoutQuery(nextRequest.url);
		return isApi
			? new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
					status: 401,
					headers: { "Content-Type": "application/json" },
			  })
			: NextResponse.redirect(new URL(logoutUrl, nextRequest.url));
	}
	console.log("rToken", rToken);
	try {
		if (aToken) {
			console.log("aToken", aToken);
			await middleware_verifyToken(aToken); // 복호화 성공(토큰유효)하면 그대로 진행
			console.log("토큰이 유효");
			return NextResponse.next();
		}
	} catch {
		// 로그아웃 쿼리 추가하여서 리다이렉트
		console.error("aToken decode error");
		const logoutUrl = addLogoutQuery(nextRequest.url);
		return isApi
			? new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
					status: 401,
					headers: { "Content-Type": "application/json" },
			  })
			: NextResponse.redirect(new URL(logoutUrl, nextRequest.url));
	}
	try {
		// accessToken이 없거나 유효하지 않은 경우 -> refreshToken으로 재발급 시도
		console.log("토큰 재발급 url로");
		// nextRequest.url에서 '/api/auth/token'요청을 한다라는 뜻 원래 url은 따로 던져야함.
		return NextResponse.redirect(new URL(`/api/auth/token?returnTo=${encodeURIComponent(nextRequest.url)}`, nextRequest.url));
	} catch {
		console.error("토큰 재발급 과정에서 오류 !!!");
		console.error("토큰 재발급 과정에서 오류 !!!");
		console.error("토큰 재발급 과정에서 오류 !!!");
		return NextResponse.next(); // 어떻게 처리할지 생각해봐야할듯
		// return NextResponse.redirect("");
	}
};

// middleware는 Edge Runtime에서 동작
export async function middleware(nextRequest: NextRequest) {
	// nextRequest.url : 쿼리 포함 path
	// const pathname = nextRequest.nextUrl.pathname; // 쿼리제외 path
	const searchParams = nextRequest.nextUrl.searchParams;
	const cookieStore = cookies(); // middleware.ts나 route handler 밖의 util함수에서 가져올 때
	// 이미 로그아웃이면 아무것도 안함.
	if (searchParams.get("logout") === "1") return NextResponse.next();

	return NextResponse.next();

	console.log("middleware ---------------------------------------------------------------------------------------------------");
	console.log("url :", nextRequest.url, ", method :", nextRequest.method, ", nextRequest.nextUrl.pathname :", nextRequest.nextUrl.pathname);

	const needsAuth = isAuthRequiredPath(nextRequest.nextUrl.pathname);
	if (!needsAuth) return NextResponse.next();

	const isApi = nextRequest.nextUrl.pathname.startsWith("/api");
	if (isApi) console.log("API요청 ====================>");
	else console.log("페이지이동 요청 ====================>");

	return handleAuthCheck(nextRequest, isApi);
}

export const config = {
	// matcher: ["/board/:path*"],
	// matcher: ['/((?!_next|favicon.ico|api|static).*)'],
	//  => _next, static, api 등은 제외 (정적 리소스 요청 제외)
	matcher: ["/((?!_next|favicon.ico|static).*)"],
	// matcher: ["/((?!_next|favicon.ico|api/public|static).*)"],
	// api/public : 인증요청 필요없는 api => 수정해야함
};

// api요청인지 구분
// 요청이 한꺼번에 올 때
