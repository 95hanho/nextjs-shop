import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData } from "@/api/fetchFilter";
import { withOptionalAuth } from "@/lib/auth";
import { isProd, WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { generatePhoneAuthCompleteToken, generatePwdResetToken, verifyPhoneAuthToken } from "@/lib/jwt";
import { PHONE_AUTH_COMPLETE_COOKIE_AGE, PWD_CHANGE_COOKIE_AGE } from "@/lib/tokenTime";
import { PhoneAuthCheckRequest } from "@/types/auth";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 휴대폰 인증 확인
export const POST = withOptionalAuth(async ({ nextRequest }) => {
	try {
		const { requestId, phoneAuthToken, authNumber }: PhoneAuthCheckRequest = await nextRequest.json();

		if (!phoneAuthToken?.trim() || !authNumber) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		try {
			verifyPhoneAuthToken(phoneAuthToken);
		} catch {
			return NextResponse.json(
				{
					status: 401,
					message: "PHONEAUTH_TOKEN_UNAUTHORIZED",
				},
				{ status: 401 },
			);
		}

		const payload: PhoneAuthCheckRequest = {
			authNumber,
			phoneAuthToken,
		};
		if (requestId) payload.requestId = requestId;

		const data = await postUrlFormData<BaseResponse & { userId?: string }>(getBackendUrl(API_URL.AUTH_PHONE_AUTH_CHECK), { ...payload });
		console.log(data);

		const responseJson: BaseResponse & { userId?: string } = { message: data.message };
		const response = NextResponse.json(responseJson, { status: 200 });
		// 사용한 토큰 제거
		response.cookies.set("phoneAuthToken", "", {
			httpOnly: true,
			secure: isProd,
			sameSite: "strict",
			path: "/",
			maxAge: 0,
		});

		if (!requestId) {
		}
		// 회원가입
		if (responseJson.message === "PHONEAUTH_VALIDATE") {
			const phoneAuthCompleteToken = generatePhoneAuthCompleteToken();
			response.cookies.set("phoneAuthCompleteToken", phoneAuthCompleteToken, {
				httpOnly: true,
				secure: isProd,
				sameSite: "strict",
				path: "/",
				maxAge: PHONE_AUTH_COMPLETE_COOKIE_AGE,
			});
			return response;
		}
		// 아이디찾기 용 아이디
		else if (responseJson.message === "IDFIND_SUCCESS" && data.userId) {
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
			const phoneAuthCompleteToken = generatePhoneAuthCompleteToken();
			response.cookies.set("phoneAuthCompleteToken", phoneAuthCompleteToken, {
				httpOnly: true,
				secure: isProd,
				sameSite: "strict",
				path: "/",
				maxAge: PHONE_AUTH_COMPLETE_COOKIE_AGE,
			});
			return response;
		}
		throw new Error("SERVER_ERROR");
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
