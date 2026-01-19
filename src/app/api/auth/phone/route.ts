import API_URL from "@/api/endpoints";
import { postUrlFormData } from "@/api/fetchFilter";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { generatePhoneAuthToken } from "@/lib/jwt";
import { PhoneAuthRequest } from "@/types/auth";
import { BaseResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

// 휴대폰 인증
export async function POST(nextRequest: NextRequest) {
	try {
		const { phone } = await nextRequest.json();
		if (!phone) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });

		const xffHeader = nextRequest.headers.get("x-forwarded-for");
		const ip =
			xffHeader?.split(",")[0]?.trim() ??
			// 일부 환경에서는 Cloudflare나 Reverse Proxy 헤더 사용
			nextRequest.headers.get("x-real-ip") ??
			"unknown";

		const phoneAuthToken = generatePhoneAuthToken();

		const payload: PhoneAuthRequest = { phone, phoneAuthToken };

		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.AUTH_PHONE_AUTH),
			{ ...payload },
			{
				userAgent: nextRequest.headers.get("user-agent") || "",
				["x-forwarded-for"]: ip,
				Authorization: `Bearer ${string}`,
			}
		);

		return NextResponse.json({ message: data.message, phoneAuthToken }, { status: 200 });
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
