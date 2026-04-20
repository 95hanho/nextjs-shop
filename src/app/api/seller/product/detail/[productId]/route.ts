import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { sellerWithAuth } from "@/lib/auth/seller";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetSellerProductDetailResponse } from "@/types/seller";
import { NextResponse } from "next/server";

// 판매자 제품 상세보기 조회
export const GET = sellerWithAuth<{ productId: string }>(async ({ params, sellerToken }) => {
	console.log("[API] 판매자 제품 상세보기 조회");
	try {
		const { productId } = params ?? {};

		if (!productId) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const data = await getNormal<GetSellerProductDetailResponse>(
			getBackendUrl(API_URL.SELLER_PRODUCT_DETAIL),
			{ productId },
			{
				Authorization: `Bearer ${sellerToken}`,
			},
		);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
