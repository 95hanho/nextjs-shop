import { verifyToken } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

// 패스워드 리셋토큰 확인
export const GET = async (nextRequest: NextRequest) => {
	const pwdResetToken = nextRequest.cookies.get("pwdResetToken")?.value || nextRequest.headers.get("pwdResetToken") || undefined;

	try {
		// ✅ 토큰이 아예 없는 경우도 인증 실패로 처리
		if (!pwdResetToken) {
			throw new Error("NO_PWDRESET_TOKEN");
		}
		verifyToken(pwdResetToken);
		// ✅ 성공 응답
		return NextResponse.json(
			{
				status: 200,
				message: "PWDRESET_AUTHORIZED",
			},
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json(
			{
				status: 401,
				message: "PWDRESET_UNAUTHORIZED",
			},
			{ status: 401 }
		);
	}
};
