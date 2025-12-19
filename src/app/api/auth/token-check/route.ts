import { verifyToken } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

// 로그인 했는지 확인(토큰확인)
export const GET = async (nextRequest: NextRequest) => {
	const refreshToken = nextRequest.cookies.get("refreshToken")?.value || nextRequest.headers.get("refreshToken") || undefined;

	try {
		// ✅ 토큰이 아예 없는 경우도 인증 실패로 처리
		if (!refreshToken) {
			throw new Error("NO_REFRESH_TOKEN");
		}

		verifyToken(refreshToken);

		// ✅ 성공 응답
		return NextResponse.json(
			{
				status: 200,
				message: "REFRESH_AUTHORIZED",
			},
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json(
			{
				status: 401,
				message: "REFRESH_UNAUTHORIZED",
			},
			{ status: 401 }
		);
	}
};
