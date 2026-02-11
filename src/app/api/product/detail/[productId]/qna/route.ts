import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, RequestHeaders } from "@/api/fetchFilter";
import { withOptionalAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetProductDetailQnaResponse } from "@/types/product";
import { NextResponse } from "next/server";

// 제품 상세조회 Q&A 조회
export const GET = withOptionalAuth<{ productId: string }>(async ({ accessToken, params }) => {
	try {
		const productId = Number(params.productId);
		if (!productId || !Number.isInteger(productId)) return NextResponse.json({ message: "productId is required" }, { status: 400 });

		const headers: RequestHeaders = {};
		if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

		const data = await getNormal<GetProductDetailQnaResponse>(getBackendUrl(API_URL.PRODUCT_DETAIL_QNA), { productId }, headers);
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
