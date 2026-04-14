import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postFormData } from "@/api/fetchFilter";
import { sellerWithAuth } from "@/lib/auth/seller";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { SetSellerProductImageRequest } from "@/types/seller";
import { NextResponse } from "next/server";

// 제품 이미지 설정
export const POST = sellerWithAuth(async ({ nextRequest, sellerToken }) => {
	console.log("[API] 제품 이미지 설정");
	try {
		const { productId, addFiles, updateFiles, deleteImageIds }: SetSellerProductImageRequest = await nextRequest.json();

		if (
			productId === undefined ||
			addFiles === undefined ||
			addFiles.length === 0 ||
			updateFiles === undefined ||
			updateFiles.length === 0 ||
			deleteImageIds === undefined ||
			deleteImageIds.length === 0
		)
			return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
		const payload: SetSellerProductImageRequest = {
			productId,
			addFiles,
			updateFiles,
			deleteImageIds,
		};
		console.log({ payload });

		// const data = await postFormData<BaseResponse>(
		// 	getBackendUrl(API_URL.SELLER_PRODUCT_IMAGE),
		// 	{ ...payload },
		// 	{
		// 		Authorization: `Bearer ${sellerToken}`,
		// 	},
		// );
		// console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
