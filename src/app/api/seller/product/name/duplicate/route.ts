import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { sellerWithAuth } from "@/lib/auth/seller";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 제품명 중복 확인
export const GET = sellerWithAuth(async ({ nextRequest, sellerToken }) => {
	console.log("[API] 제품명 중복 확인");
	try {
		const productName = nextRequest.nextUrl.searchParams.get("productName");
		if (!productName) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const data = await getNormal<BaseResponse>(
			getBackendUrl(API_URL.SELLER_PRODUCT_NAME_DUPLICATE),
			{ productName },
			{
				Authorization: `Bearer ${sellerToken}`,
			},
		);
		// console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
