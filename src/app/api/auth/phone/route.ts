import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData, RequestHeaders } from "@/api/fetchFilter";
import { userWithOptionalAuth } from "@/lib/auth/user";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env.server";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { generatePhoneAuthToken } from "@/lib/auth/utils/token";
import { PhoneAuthRequest } from "@/types/auth";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 휴대폰 인증
export const POST = userWithOptionalAuth(async ({ nextRequest, accessToken }) => {
	console.log("[API] 휴대폰 인증");
	try {
		const { phone, mode, userId }: PhoneAuthRequest = await nextRequest.json();
		if (!phone) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const xffHeader = nextRequest.headers.get("x-forwarded-for");
		const ip =
			xffHeader?.split(",")[0]?.trim() ??
			// 일부 환경에서는 Cloudflare나 Reverse Proxy 헤더 사용
			nextRequest.headers.get("x-real-ip") ??
			"unknown";

		const phoneAuthToken = generatePhoneAuthToken();

		const payload: PhoneAuthRequest = { phone, mode, phoneAuthToken };
		if (userId && mode == "PWDFIND") payload.userId = userId; // PW 찾기 시 userId 포함
		const headers: RequestHeaders = {
			userAgent: nextRequest.headers.get("user-agent") || "",
			["x-forwarded-for"]: ip,
		};
		if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.AUTH_PHONE_AUTH), { ...payload }, headers);

		return NextResponse.json({ message: data.message, phoneAuthToken }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
