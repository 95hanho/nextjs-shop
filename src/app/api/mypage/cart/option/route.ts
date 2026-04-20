import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, RequestHeaders } from "@/api/fetchFilter";
import { withOptionalAuth } from "@/lib/auth/user";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetCartOtherOptionListResponse } from "@/types/mypage";
import { NextResponse } from "next/server";

// 장바구니 제품 다른 option조회
export const GET = withOptionalAuth(async ({ nextRequest, accessToken }) => {
	console.log("[API] 장바구니 제품 다른 option조회");
	try {
		const productId = nextRequest.nextUrl.searchParams.get("productId");
		if (!productId) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const headers: RequestHeaders = {};
		if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

		const data = await getNormal<GetCartOtherOptionListResponse>(getBackendUrl(API_URL.MY_CART_PRODUCT_OPTION), { productId }, headers);
		// console.log("cartOptionProductOptionList", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
