import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { deleteNormal } from "@/api/fetchFilter";
import { userWithAuth } from "@/lib/auth/user";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 제품 리뷰 삭제
export const DELETE = userWithAuth<{ productId: string; reviewId: string }>(async ({ accessToken, params }) => {
	console.log("[API] 제품 리뷰 삭제");
	try {
		const productId = Number(params.productId);
		const reviewId = Number(params.reviewId);
		if (!productId || !Number.isInteger(productId) || !reviewId || !Number.isInteger(reviewId))
			return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const data = await deleteNormal<BaseResponse>(
			getBackendUrl(API_URL.PRODUCT_DETAIL_REVIEW_DELETE),
			{ productId, reviewId },
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
