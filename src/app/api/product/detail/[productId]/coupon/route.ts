import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetProductDetailCouponResponse } from "@/types/product";
import { NextResponse } from "next/server";

// 제품 상세조회 쿠폰 조회
export const GET = withAuth<{ productId: string }>(async ({ accessToken, params }) => {
	try {
		const productId = Number(params.productId);
		if (!productId || !Number.isInteger(productId)) {
			return NextResponse.json({ message: "productId is required" }, { status: 400 });
		}

		const data = await getNormal<GetProductDetailCouponResponse>(
			getBackendUrl(API_URL.PRODUCT_DETAIL_COUPON),
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
