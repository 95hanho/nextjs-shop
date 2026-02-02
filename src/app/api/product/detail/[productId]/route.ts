import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetProductDetailResponse } from "@/types/product";
import { NextResponse } from "next/server";

// 제품 상세보기 조회
export const GET = withAuth<{ productId: string }>(async ({ accessToken, params }) => {
	try {
		const productId = Number(params.productId);
		if (productId <= 0 || !Number.isInteger(productId)) return NextResponse.json({ message: "productId is required" }, { status: 400 });

		const data = await getNormal<GetProductDetailResponse>(
			getBackendUrl(API_URL.PRODUCT_DETAIL),
			{ productId },
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
