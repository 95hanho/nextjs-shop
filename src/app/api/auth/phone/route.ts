import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData } from "@/api/fetchFilter";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { generatePhoneAuthToken } from "@/lib/jwt";
import { PhoneAuthRequest } from "@/types/auth";
import { BaseResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

// 휴대폰 인증
export const POST = async (nextRequest: NextRequest) => {
	try {
		const { phone } = await nextRequest.json();
		if (!phone) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const accessToken = nextRequest.cookies.get("accessToken")?.value || nextRequest.headers.get("accessToken") || undefined;

		const xffHeader = nextRequest.headers.get("x-forwarded-for");
		const ip =
			xffHeader?.split(",")[0]?.trim() ??
			// 일부 환경에서는 Cloudflare나 Reverse Proxy 헤더 사용
			nextRequest.headers.get("x-real-ip") ??
			"unknown";

		const phoneAuthToken = generatePhoneAuthToken(phone);

		const payload = { phoneAuthToken };

		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.AUTH_PHONE_AUTH),
			{ ...payload },
			{
				userAgent: nextRequest.headers.get("user-agent") || "",
				["x-forwarded-for"]: ip,
				Authorization: `Bearer ${accessToken}`,
			},
		);

		return NextResponse.json({ message: data.message, phoneAuthToken }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
};
