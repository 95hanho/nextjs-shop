import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, RequestHeaders } from "@/api/fetchFilter";
import { withOptionalAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { ProductReviewResponse } from "@/types/product";
import { NextResponse } from "next/server";

// 제품 리뷰 조회
export const GET = withOptionalAuth(async ({ accessToken, nextRequest }) => {
	try {
		console.log("제품 리뷰 조회");
		const productId = nextRequest.nextUrl.searchParams.get("productId");
		if (!productId) return NextResponse.json({ message: "productId is required" }, { status: 400 });

		const headers: RequestHeaders = {};
		if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

		const data = await getNormal<ProductReviewResponse>(getBackendUrl(API_URL.PRODUCT_REVIEW), { productId }, headers);
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
