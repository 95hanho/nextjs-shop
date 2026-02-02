import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { AddCartRequest } from "@/types/product";
import { NextResponse } from "next/server";

// 장바구니 넣기
export const POST = withAuth(async ({ nextRequest, accessToken }) => {
	try {
		const { productOptionId, quantity }: AddCartRequest = await nextRequest.json();
		if (!productOptionId || !quantity) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: AddCartRequest = { productOptionId, quantity };
		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.PRODUCT_CART),
			{ ...payload },
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
