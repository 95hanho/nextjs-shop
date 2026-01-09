import { verifyPwdResetToken, verifyToken } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

// 로그인 했는지 확인(토큰확인) AND 패스워드 리셋토큰 확인
export const GET = async (nextRequest: NextRequest) => {
	const pwdResetToken = nextRequest.cookies.get("pwdResetToken")?.value || nextRequest.headers.get("pwdResetToken") || undefined;
	const refreshToken = nextRequest.cookies.get("refreshToken")?.value || nextRequest.headers.get("refreshToken") || undefined;

	try {
		// ✅ 토큰이 아예 없는 경우도 인증 실패로 처리
		if (!pwdResetToken?.trim()) {
			throw new Error("NO_PWDRESET_TOKEN");
		}
		verifyPwdResetToken(pwdResetToken);
	} catch (error) {
		return NextResponse.json(
			{
				status: 401,
				message: "PWDRESET_UNAUTHORIZED",
			},
			{ status: 401 }
		);
	}

	try {
		// ✅ 토큰이 아예 없는 경우도 인증 실패로 처리
		if (!refreshToken?.trim()) {
			throw new Error("NO_REFRESH_TOKEN");
		}
		verifyToken(refreshToken);
	} catch (error) {
		return NextResponse.json(
			{
				status: 401,
				message: "REFRESH_UNAUTHORIZED",
			},
			{ status: 401 }
		);
	}

	// ✅ 성공 응답
	return NextResponse.json(
		{
			status: 200,
			message: "PWDRESET_AUTHORIZED",
		},
		{ status: 200 }
	);
};
