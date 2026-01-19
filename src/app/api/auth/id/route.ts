import API_URL from "@/api/endpoints";
import { postUrlFormData } from "@/api/fetchFilter";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

// 아이디 중복 체크
export async function GET(nextRequest: NextRequest) {
	try {
		const userId = nextRequest.nextUrl.searchParams.get("userId");
		if (!userId) return NextResponse.json({ message: "아이디를 입력해주세요." }, { status: 400 });
		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.AUTH_ID), { userId });
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
