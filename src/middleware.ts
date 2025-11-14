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

		// 로그인은 필요하지만 refreshToken도 없음 → 완전 로그아웃 상태
		// 에러 형태 동일하게 통일 좀 해야할듯
		return isApi
			? new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
					status: 401,
					headers: { "Content-Type": "application/json" },
			  })
			: NextResponse.redirect(new URL(logoutUrl, nextRequest.url));
	}
	console.log("rToken", rToken);
	// 여긴 "로그인 필요 + refreshToken은 있음" 상태
	// aToken 유효하면 그냥 next, 유효하지 않으면? → 여기서는 지나가게 두고, 실제 리프레시는 API 쪽 helper에서
	if (aToken) {
		try {
			console.log("aToken", aToken);
			await middleware_verifyToken(aToken); // 복호화 성공(토큰유효)하면 그대로 진행
			console.log("토큰이 유효");
			return NextResponse.next();
		} catch {
			// 로그아웃 쿼리 추가하여서 리다이렉트
			// 유효하지 않으면? → 여기서는 지나가게 두고, 실제 리프레시는 API 쪽 helper에서 처리하기
			console.warn("aToken invalid in middleware, but rToken exists → API에서 리프레시 처리");
			return NextResponse.next();
		}
	}
	// accessToken이 아예 없고 refreshToken만 있는 경우도 마찬가지로 API helper에서 처리
	return NextResponse.next();
};

// middleware는 Edge Runtime에서 동작
export async function middleware(nextRequest: NextRequest) {
	// nextRequest.url : 쿼리 포함 path
	// const pathname = nextRequest.nextUrl.pathname; // 쿼리제외 path
	const searchParams = nextRequest.nextUrl.searchParams;
	// const cookieStore = await cookies(); // middleware.ts나 route handler 밖의 util함수에서 가져올 때, 안되는거 같은데...
	// console.log("middleware", nextRequest.url, "---------------------------------------------------------------------------------------------------");
	// console.log("middleware accessToken", nextRequest.cookies.get("accessToken")?.value.substring(0, 10));
	// console.log("next/headers accessToken", (await cookieStore).get("accessToken")?.value.substring(0, 10));

	// 이미 로그아웃이면 아무것도 안함.
	if (searchParams.get("logout") === "1") return NextResponse.next();

	// return NextResponse.next();

	// console.log(
	// 	"middleware =====>> url :",
	// 	nextRequest.url,
	// 	", method :",
	// 	nextRequest.method,
	// 	", nextRequest.nextUrl.pathname :",
	// 	nextRequest.nextUrl.pathname
	// );

	const needsAuth = isAuthRequiredPath(nextRequest.nextUrl.pathname);
	if (!needsAuth) return NextResponse.next();

	const isApi = nextRequest.nextUrl.pathname.startsWith("/api");
	// if (isApi) console.log("API요청 ====================>");
	// else console.log("페이지이동 요청 ====================>");

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
