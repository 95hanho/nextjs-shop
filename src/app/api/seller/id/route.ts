import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData } from "@/api/fetchFilter";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

// 판매자id 중복확인
export const POST = async (nextRequest: NextRequest) => {
	try {
		const { sellerId }: { sellerId: string } = await nextRequest.json();
		if (!sellerId) return NextResponse.json({ message: "아이디를 입력해주세요." }, { status: 400 });
		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.SELLER_ID), { sellerId });
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
};
