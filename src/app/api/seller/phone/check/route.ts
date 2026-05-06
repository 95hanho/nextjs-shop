import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData } from "@/api/fetchFilter";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env.server";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { generatePhoneAuthCompleteToken, verifyPhoneAuthToken } from "@/lib/auth/utils/token";
import { PHONE_AUTH_COMPLETE_COOKIE_AGE } from "@/lib/auth/utils/tokenTime";
import { PhoneAuthCheckResponse } from "@/types/auth";
import { NextRequest, NextResponse } from "next/server";
import { isProd } from "@/lib/env.common";
import { SellerPhoneAuthCheckRequest } from "@/types/seller";

// 판매자 전화번호 인증 확인
export const POST = async (nextRequest: NextRequest) => {
	console.log("[API] 판매자 전화번호 인증 확인");
	try {
		const { phoneAuthToken, authNumber }: SellerPhoneAuthCheckRequest = await nextRequest.json();

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

		const payload: SellerPhoneAuthCheckRequest = {
			authNumber,
			phoneAuthToken,
		};

		const data = await postUrlFormData<PhoneAuthCheckResponse>(getBackendUrl(API_URL.SELLER_PHONE_AUTH_CHECK), {
			...payload,
		});
		// console.log("data", data);

		const response = NextResponse.json({ ...data }, { status: 200 });

		// 사용한 토큰 제거
		response.cookies.set("phoneAuthToken", "", {
			httpOnly: true,
			secure: isProd,
			sameSite: "strict",
			path: "/",
			maxAge: 0,
		});

		// 회원가입, 전화번호 변경
		if (data.message === "PHONEAUTH_VALIDATE") {
			// 완료 인증 토큰
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
};
