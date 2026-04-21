import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { sellerWithAuth } from "@/lib/auth/seller";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetSellerReviewResponse } from "@/types/seller";
import { NextResponse } from "next/server";

// 판매자 리뷰 조회
export const GET = sellerWithAuth(async ({ sellerToken }) => {
	console.log("[API] 판매자 리뷰 조회");
	try {
		const data = await getNormal<GetSellerReviewResponse>(getBackendUrl(API_URL.SELLER_REVIEW), undefined, {
			Authorization: `Bearer ${sellerToken}`,
		});
		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		console.error("[API] 판매자 리뷰 조회 실패");
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
