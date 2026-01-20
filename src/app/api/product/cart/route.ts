import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { AddCartRequest } from "@/types/product";
import { NextResponse } from "next/server";

// 장바구니 넣기
export const POST = withAuth(async ({ nextRequest, accessToken }) => {
	try {
		const { productOptionId, quantity } = await nextRequest.json();
		if (!productOptionId || !quantity) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });

		const payload: AddCartRequest = { productOptionId, quantity };
		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.PRODUCT_CART),
			{ ...payload },
			{
				Authorization: `Bearer ${accessToken}`,
			}
		);
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
