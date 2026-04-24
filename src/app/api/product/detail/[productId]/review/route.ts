import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, RequestHeaders } from "@/api/fetchFilter";
import { userWithOptionalAuth } from "@/lib/auth/user";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetProductDetailReviewResponse } from "@/types/product";
import { NextResponse } from "next/server";

// 제품 상세조회 리뷰 조회
export const GET = userWithOptionalAuth<{ productId: string }>(async ({ nextRequest, accessToken, params }) => {
	console.log("[API] 제품 상세조회 리뷰 조회");
	try {
		const productId = Number(params.productId);
		const page = Number(nextRequest.nextUrl.searchParams.get("page"));
		if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(page) || page <= 0) {
			return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
		}

		const headers: RequestHeaders = {};
		if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

		const data = await getNormal<GetProductDetailReviewResponse>(
			getBackendUrl(API_URL.PRODUCT_DETAIL_REVIEW),
			{
				productId,
				page: Number(page),
			},
			headers,
		);
		// console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
