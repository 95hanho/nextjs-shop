import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData, RequestHeaders } from "@/api/fetchFilter";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env.server";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { generatePhoneAuthToken } from "@/lib/auth/utils/token";
import { BaseResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";
import { SellerPhoneAuthRequest } from "@/types/seller";

// 판매자 전화번호 인증
export const POST = async (nextRequest: NextRequest) => {
	console.log("[API] 판매자 전화번호 인증");
	try {
		const { phone, mode }: SellerPhoneAuthRequest = await nextRequest.json();
		if (!phone) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const xffHeader = nextRequest.headers.get("x-forwarded-for");
		const ip =
			xffHeader?.split(",")[0]?.trim() ??
			// 일부 환경에서는 Cloudflare나 Reverse Proxy 헤더 사용
			nextRequest.headers.get("x-real-ip") ??
			"unknown";

		const phoneAuthToken = generatePhoneAuthToken();

		const payload: SellerPhoneAuthRequest = { phone, mode, phoneAuthToken };
		const headers: RequestHeaders = {
			userAgent: nextRequest.headers.get("user-agent") || "",
			["x-forwarded-for"]: ip,
		};

		const data = await postUrlFormData<BaseResponse & { testCode: string }>(getBackendUrl(API_URL.SELLER_PHONE_AUTH), { ...payload }, headers);

		return NextResponse.json({ message: data.message, phoneAuthToken, testCode: data.testCode }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
};
