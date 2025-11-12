import API_URL from "@/api/endpoints";
import { postUrlFormData } from "@/api/fetchFilter";
import { getServerUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

// 휴대폰 인증
export async function POST(nextRequest: NextRequest) {
	try {
		const { phone } = await nextRequest.json();
		const data = await postUrlFormData<BaseResponse>(getServerUrl(API_URL.USER_PHONE_AUTH), { phone });
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
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
