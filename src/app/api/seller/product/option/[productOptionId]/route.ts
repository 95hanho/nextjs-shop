import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { deleteNormal } from "@/api/fetchFilter";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { withSellerAuth } from "@/lib/seller/auth";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 제품 옵션 삭제
export const DELETE = withSellerAuth<{ productOptionId: string }>(async ({ params }) => {
	try {
		const productOptionId = Number(params.productOptionId);
		if (!productOptionId) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
		const data = await deleteNormal<BaseResponse>(getBackendUrl(API_URL.SELLER_PRODUCT_OPTION_DELETE), { productOptionId });
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
