import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData } from "@/api/fetchFilter";
import { userWithAuth } from "@/lib/auth/user";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 제품 상세보기 제품 뷰 테이블 삽입
export const POST = userWithAuth<{ productId: string }>(async ({ params, accessToken }) => {
	console.log("[API] 제품 상세보기 제품 뷰 테이블 삽입");
	try {
		const productId = Number(params.productId);
		if (!productId) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.PRODUCT_DETAIL_VIEW),
			{ productId },
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);
		// console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
