import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { userWithOptionalAuth } from "@/lib/auth/user";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env.server";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetProductOptionListResponse } from "@/types/product";
import { NextResponse } from "next/server";

// 제품상세보기 옵션 조회
export const GET = userWithOptionalAuth(async ({ params }) => {
	console.log("[API] 제품상세보기 옵션 조회");
	try {
		const productId = params.productId;
		if (!productId) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const data = await getNormal<GetProductOptionListResponse>(getBackendUrl(API_URL.PRODUCT_DETAIL_OPTION), { productId });
		// console.log("productDetailOptionList", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
