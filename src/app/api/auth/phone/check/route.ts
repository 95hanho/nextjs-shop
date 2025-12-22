import API_URL from "@/api/endpoints";
import { postUrlFormData } from "@/api/fetchFilter";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { verifyToken } from "@/lib/jwt";
import { BaseResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

// 휴대폰 인증 확인
export async function POST(nextRequest: NextRequest) {
	try {
		const { userId, phoneAuthToken, authNumber } = await nextRequest.json();

		if (!phoneAuthToken || !authNumber) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });

		try {
			const tokenData = verifyToken(phoneAuthToken);
			if (userId && tokenData.userId !== userId) {
				throw new Error("NOT_EQUAL_ID");
			}
		} catch (err) {
			return NextResponse.json(
				{
					status: 401,
					message: "PHONEAUTH_TOKEN_UNAUTHORIZED",
				},
				{ status: 401 }
			);
		}

		const data = await postUrlFormData<BaseResponse & { userId?: string }>(getBackendUrl(API_URL.AUTH_PHONE_AUTH_CHECK), {
			authNumber,
			phoneAuthToken,
		});

		const response: BaseResponse & { userId?: string } = { message: data.message };
		// 아이디찾기 용 아이디
		if (data.userId) response.userId = data.userId;
		// 비밀번호 찾기 페이지로 가기위한 쿠키저장.
		if (response.message === "PWDFIND_SUCCESS") {
			// pwdResetToken
			// response.cookies.set("accessToken", accessToken, {
			// 	httpOnly: true,
			// 	secure: isProd,
			// 	sameSite: "strict",
			// 	path: "/",
			// 	maxAge: ACCESS_TOKEN_COOKIE_AGE,
			// });
		}

		return NextResponse.json(response, { status: 200 });
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
