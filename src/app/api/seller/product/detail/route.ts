import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { AddSellerProductOption, UpdateSellerProductOption } from "@/types/seller";
import { NextResponse } from "next/server";

// 판매자 제품 상세 추가/수정
export const POST = withAuth(async ({ nextRequest }) => {
	try {
		// json으로 받으면
		const { productId, addPrice, stock, size, productOptionId } = await nextRequest.json();
		let payload: AddSellerProductOption | UpdateSellerProductOption;
		// 추가
		if (!productOptionId) {
			if (!productId || !addPrice || !stock || !size) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
			payload = { productId, addPrice, stock, size };
		}
		// 수정
		else {
			if (!productOptionId || !addPrice || !stock) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
			payload = { productOptionId, addPrice, stock };
		}

		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.SELLER_PRODUCT_DETAIL), { ...payload });
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
