import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData, putUrlFormData } from "@/api/fetchFilter";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { withSellerAuth } from "@/lib/seller/auth";
import { BaseResponse } from "@/types/common";
import { AddSellerProductOption, UpdateSellerProductOption } from "@/types/seller";
import { NextResponse } from "next/server";

// 제품 옵션 추가
export const POST = withSellerAuth(async ({ nextRequest, sellerToken }) => {
	try {
		const { productId, addPrice, stock, size }: AddSellerProductOption = await nextRequest.json();
		if (!productId || !addPrice || !stock || !size) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: AddSellerProductOption = {
			productId,
			addPrice,
			stock,
			size,
		};

		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.SELLER_PRODUCT_OPTION),
			{ ...payload },
			{
				Authorization: `Bearer ${sellerToken}`,
			},
		);
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
// 제품 옵션 수정
export const PUT = withSellerAuth(async ({ nextRequest, sellerToken }) => {
	try {
		const { productOptionId, addPrice, stock, isDisplayed }: UpdateSellerProductOption = await nextRequest.json();
		if (!productOptionId || !addPrice || !stock || !isDisplayed) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: UpdateSellerProductOption = {
			productOptionId,
			addPrice,
			stock,
			isDisplayed,
		};

		const data = await putUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.SELLER_PRODUCT_OPTION),
			{ ...payload },
			{
				Authorization: `Bearer ${sellerToken}`,
			},
		);
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
