import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, RequestHeaders } from "@/api/fetchFilter";
import { userWithOptionalAuth } from "@/lib/auth/user";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { SellerLikeAndOtherProductsResponse } from "@/types/product";
import { NextResponse } from "next/server";

// 판매자 좋아요 여부 및 판매자 다른 제품 조회
export const GET = userWithOptionalAuth<{ productId: string }>(async ({ accessToken, params }) => {
	console.log("[API] 판매자 좋아요 여부 및 판매자 다른 제품 조회");
	try {
		const productId = Number(params.productId);
		if (!productId || !Number.isInteger(productId)) return NextResponse.json({ message: "productId is required" }, { status: 400 });

		const headers: RequestHeaders = {};
		if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

		const data = await getNormal<SellerLikeAndOtherProductsResponse>(
			getBackendUrl(API_URL.PRODUCT_SELLER_LIKE_OTHER_PRODUCT),
			{ productId },
			headers,
		);

		// console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
