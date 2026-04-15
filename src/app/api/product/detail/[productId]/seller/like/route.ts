import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData } from "@/api/fetchFilter";
import { userWithAuth } from "@/lib/auth/user";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 판매자 좋아요/취소
export const POST = userWithAuth<{ productId: string }>(async ({ nextRequest, accessToken, params }) => {
	console.log("[API] 판매자 좋아요/취소");
	try {
		const productId = Number(params.productId);
		const { like } = await nextRequest.json();
		if (!productId || like === undefined) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.PRODUCT_SELLER_LIKE),
			{ productId, like },
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
