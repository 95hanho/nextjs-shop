import API_URL from "@/api/endpoints";
import { postUrlFormData } from "@/api/fetchFilter";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { BaseResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

// 휴대폰 인증
export async function POST(nextRequest: NextRequest) {
	try {
		const { userId, phone } = await nextRequest.json();
		if (!phone) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });

		let phoneAuthToken;
		if (userId) phoneAuthToken = generateAccessToken({ userId }, "3m");
		else phoneAuthToken = generateRefreshToken("3m");

		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.AUTH_PHONE_AUTH), { phone, phoneAuthToken });

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
