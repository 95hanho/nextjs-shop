import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { isProd } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { ACCESS_TOKEN_COOKIE_AGE, REFRESH_TOKEN_COOKIE_AGE } from "@/lib/tokenTime";
import { LoginForm, LoginResponse, UserResponse } from "@/types/auth";
import { BaseResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

// 회원정보가져오기
// - 초기패이지로딩(로그인되어있을 때), 로그인, 로그아웃, 유저정보필요할 때, 유저정보수정(상태변화)
// 할 때 바로 가져올 수 있게 useQuery 실행함.
export const GET = withAuth(async ({ accessToken }) => {
	try {
		console.log("accessToken ===", accessToken);
		const data = await getNormal<UserResponse>(getBackendUrl(API_URL.AUTH), undefined, {
			Authorization: `Bearer ${accessToken}`,
		});
		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});

// 로그인
export async function POST(nextRequest: NextRequest) {
	console.log("로그인");
	try {
		const { userId, password }: LoginForm = await nextRequest.json();
		if (!userId) return NextResponse.json({ message: "아이디를 입력해주세요." }, { status: 400 });
		if (!password) return NextResponse.json({ message: "비밀번호를 입력해주세요." }, { status: 400 });

		const loginValidateData = await postUrlFormData<LoginResponse>(getBackendUrl(API_URL.AUTH), { userId, password });
		console.log("loginValidateData", loginValidateData);
		/* 에러는 FE에서 처리 */
		// if (res.status === 401) {
		// 	return res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
		// }
		// if (!res.ok) {
		// 	// Spring 에러 그대로 전달하지 말고 요약해서 반환
		// 	console.error("Spring auth error:", await res.text());
		// 	return response.status(502).json({ message: "인증 서버 오류" });
		// }
		// ✅ HttpOnly 쿠키 설정
		const userNo = loginValidateData.userNo;
		const accessToken = generateAccessToken({ userNo });
		const refreshToken = generateRefreshToken();
		console.log("accessToken", accessToken);
		console.log("refreshToken", refreshToken);

		const xffHeader = nextRequest.headers.get("x-forwarded-for");
		const ip =
			xffHeader?.split(",")[0]?.trim() ??
			// 일부 환경에서는 Cloudflare나 Reverse Proxy 헤더 사용
			nextRequest.headers.get("x-real-ip") ??
			"unknown";

		// 토큰 저장하기 : refreshToken랑 정보랑 유저 agent, ip 정보 보내기
		await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.AUTH_TOKEN),
			{ refreshToken },
			{
				Authorization: `Bearer ${accessToken}`,
				userAgent: nextRequest.headers.get("user-agent") || "",
				["x-forwarded-for"]: ip,
			},
		);

		const response = NextResponse.json({ message: "LOGIN_SUCCESS" }, { status: 200 });
		response.cookies.set("accessToken", accessToken, {
			httpOnly: true,
			secure: isProd,
			sameSite: "strict",
			path: "/",
			maxAge: ACCESS_TOKEN_COOKIE_AGE,
		});
		response.cookies.set("refreshToken", refreshToken, {
			httpOnly: true,
			secure: isProd,
			sameSite: "strict",
			path: "/",
			maxAge: REFRESH_TOKEN_COOKIE_AGE,
		});
		// response.headers.set(
		// 	"Set-Cookie",
		// 	[
		// 		`accessToken=${accessToken}; Path=/; HttpOnly; ${isProd ? "Secure; " : ""}SameSite=Strict; Max-Age=${ACCESS_TOKEN_COOKIE_AGE}`,
		// 		`refreshToken=${refreshToken}; Path=/; HttpOnly; ${isProd ? "Secure; " : ""}SameSite=Strict; Max-Age=${REFRESH_TOKEN_COOKIE_AGE}`,
		// 	].join(", ")
		// );
		return response;
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
}
