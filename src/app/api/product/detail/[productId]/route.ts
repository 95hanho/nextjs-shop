import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { GetProductDetailResponse } from "@/types/product";
import { NextResponse } from "next/server";

// 제품 상세보기 조회
export const GET = withAuth(async ({ nextRequest, accessToken, params }) => {
	try {
		const productIdParam = params?.productId;

		// 1️⃣ 존재 여부
		if (!productIdParam) {
			return NextResponse.json({ message: "productId is required" }, { status: 400 });
		}

		// 2️⃣ 숫자 여부
		const productId = Number(productIdParam);
		if (!Number.isInteger(productId) || productId <= 0) {
			return NextResponse.json({ message: "productId must be a positive integer" }, { status: 400 });
		}

		const data = await getNormal<GetProductDetailResponse>(
			getBackendUrl(API_URL.PRODUCT_DETAIL),
			{ productId },
			{
				Authorization: `Bearer ${accessToken}`,
			}
		);
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
