import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { userWithAuth } from "@/lib/auth/user";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetProductDetailImageResponse } from "@/types/product";
import { NextResponse } from "next/server";

// 제품 상세보기 상세이미지(상품소개) 조회
export const GET = userWithAuth<{ productId: string }>(async ({ accessToken, params }) => {
	console.log("[API] 제품 상세보기 상세이미지(상품소개) 조회");
	try {
		const productId = Number(params.productId);
		if (!productId || !Number.isInteger(productId)) {
			return NextResponse.json({ message: "productId is required" }, { status: 400 });
		}

		const data = await getNormal<GetProductDetailImageResponse>(
			getBackendUrl(API_URL.PRODUCT_DETAIL_IMAGE),
			{ productId },
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);
		// console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
