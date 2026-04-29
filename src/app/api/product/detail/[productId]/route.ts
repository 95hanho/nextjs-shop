import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, RequestHeaders } from "@/api/fetchFilter";
import { userWithOptionalAuth } from "@/lib/auth/user";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetProductDetailResponse } from "@/types/product";
import { NextResponse } from "next/server";

// 제품 상세보기 조회
export const GET = userWithOptionalAuth<{ productId: string }>(async ({ accessToken, params }) => {
	try {
		const productId = Number(params.productId);
		if (productId <= 0 || !Number.isInteger(productId)) return NextResponse.json({ message: "productId is required" }, { status: 400 });

		const headers: RequestHeaders = {};
		if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

		const data = await getNormal<GetProductDetailResponse>(getBackendUrl(API_URL.PRODUCT_DETAIL), { productId }, headers);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
