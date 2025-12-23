import API_URL from "@/api/endpoints";
import { postUrlFormData } from "@/api/fetchFilter";
import { isProd } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { generateAccessToken, generatePwdResetToken, verifyPhoneAuthToken, verifyToken } from "@/lib/jwt";
import { PWD_CHANGE_COOKIE_AGE } from "@/lib/tokenTime";
import { BaseResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

// 휴대폰 인증 확인
export async function POST(nextRequest: NextRequest) {
	try {
		const { userId, phoneAuthToken, authNumber } = await nextRequest.json();

		if (!phoneAuthToken || !authNumber) return NextResponse.json({ message: "잘 못 된 요청입니z다." }, { status: 400 });

		try {
			const tokenData = verifyPhoneAuthToken(phoneAuthToken);
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

		const responseJson: BaseResponse & { userId?: string } = { message: data.message };
		const response = NextResponse.json(responseJson, { status: 200 });
		// 아이디찾기 용 아이디
		if (responseJson.message === "IDFIND_SUCCESS" && data.userId) {
			responseJson.userId = data.userId;
			return response;
		}
		// 비밀번호 찾기 페이지로 가기위한 쿠키저장.
		else if (responseJson.message === "PWDFIND_SUCCESS" && data.userId) {
			const pwdResetToken = generatePwdResetToken({ userId: data.userId });
			response.cookies.set("pwdResetToken", pwdResetToken, {
				httpOnly: true,
				secure: isProd,
				sameSite: "strict",
				path: "/",
				maxAge: PWD_CHANGE_COOKIE_AGE,
			});
			return response;
		}
		throw new Error("SERVER_ERROR");
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
