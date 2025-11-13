import API_URL from "@/api/endpoints";
import { getNormal, postUrlFormData } from "@/api/fetchFilter";
import { getServerUrl } from "@/lib/getBaseUrl";
import { generateAccessToken, generateRefreshToken, verifyToken } from "@/lib/jwt";
import { ACCESS_TOKEN_COOKIE_AGE, REFRESH_TOKEN_COOKIE_AGE } from "@/lib/tokenTime";
import { LoginForm, UserResponse } from "@/types/auth";
import { BaseResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

// 회원정보가져오기
export async function GET(nextRequest: NextRequest) {
	console.log("url :", nextRequest.url);

	try {
		const accessToken = nextRequest.cookies.get("accessToken")?.value;
		if (!accessToken) return NextResponse.json({ message: "인증 정보가 없습니다. 로그인 후 다시 시도해주세요." }, { status: 401 });
		const token = verifyToken(accessToken);
		const userId = token.userId;

		const data = await getNormal<UserResponse>(getServerUrl(API_URL.USER), { userId });
		return NextResponse.json({ message: data.message, user: data.user }, { status: 200 });
	} catch (err: any) {
		console.error("error :", {
			message: err.message,
			status: err.status,
			data: err.data,
		});

		const status = Number.isInteger(err?.status) ? err.status : 500;
		const payload = err?.data && typeof err.data === "object" ? err.data : { message: err?.message || "SERVER_ERROR" };

		return NextResponse.json(payload, { status });
	}
}

// 로그인
export async function POST(nextRequest: NextRequest) {
	console.log("로그인");
	try {
		const { userId, password }: LoginForm = await nextRequest.json();
		if (!userId) return NextResponse.json({ message: "아이디를 입력해주세요." }, { status: 400 });
		if (!password) return NextResponse.json({ message: "비밀번호를 입력해주세요." }, { status: 400 });

		const loginValidateData = await postUrlFormData<BaseResponse>(getServerUrl(API_URL.USER), { userId, password });
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
		const accessToken = generateAccessToken({ userId });
		const refreshToken = generateRefreshToken();
		console.log("accessToken", accessToken, "refreshToken", refreshToken);

		const xffHeader = nextRequest.headers.get("x-forwarded-for");
		const ip =
			xffHeader?.split(",")[0]?.trim() ??
			// 일부 환경에서는 Cloudflare나 Reverse Proxy 헤더 사용
			nextRequest.headers.get("x-real-ip") ??
			"unknown";

		// 토큰 저장하기 : refreshToken랑 정보랑 유저 agent, ip 정보 보내기
		await postUrlFormData<BaseResponse>(
			getServerUrl(API_URL.USER_TOKEN),
			{ refreshToken, userId },
			{
				userAgent: nextRequest.headers.get("user-agent") || "",
				["x-forwarded-for"]: ip,
			}
		);

		const response = NextResponse.json({ message: "LOGIN_SUCCESS" }, { status: 200 });
		response.headers.set(
			"Set-Cookie",
			[
				`accessToken=${accessToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${ACCESS_TOKEN_COOKIE_AGE}`,
				`refreshToken=${refreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${REFRESH_TOKEN_COOKIE_AGE}`,
			].join(", ")
		);
		return response;
	} catch (err: any) {
		console.error("error :", {
			message: err.message,
			status: err.status,
			data: err.data,
		});

		const status = Number.isInteger(err?.status) ? err.status : 500;
		const payload = err?.data && typeof err.data === "object" ? err.data : { message: err?.message || "SERVER_ERROR" };

		return NextResponse.json(payload, { status });
	}
}
