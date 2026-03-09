import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, postJson } from "@/api/fetchFilter";
import { userWithAuth } from "@/lib/auth/user";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { AddCartRequest } from "@/types/product";
import { NextResponse } from "next/server";

// 장바구니 확인
export const GET = userWithAuth(async ({ nextRequest, accessToken }) => {
	console.log("[API] 장바구니 확인");
	try {
		const productId = nextRequest.nextUrl.searchParams.get("productId");
		if (!productId) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const data = await getNormal<BaseResponse & { hasCart: boolean }>(
			getBackendUrl(API_URL.PRODUCT_CART),
			{ productId },
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);

		return NextResponse.json(data, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});

// 장바구니 넣기
export const POST = userWithAuth(async ({ nextRequest, accessToken }) => {
	console.log("[API] 장바구니 넣기");
	try {
		const { addCartList, productId }: AddCartRequest = await nextRequest.json();
		if (!addCartList || addCartList.length === 0 || !productId) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: AddCartRequest = { addCartList, productId };
		const data = await postJson<BaseResponse>(
			getBackendUrl(API_URL.PRODUCT_CART),
			{ ...payload },
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);
		// console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
