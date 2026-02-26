import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetCartOtherOptionListResponse } from "@/types/mypage";
import { NextResponse } from "next/server";

// 장바구니 제품 다른 option조회
export const GET = withAuth(async ({ nextRequest, accessToken }) => {
	try {
		const productId = nextRequest.nextUrl.searchParams.get("productId");
		if (!productId) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
		const data = await getNormal<GetCartOtherOptionListResponse>(
			getBackendUrl(API_URL.MY_CART_PRODUCT_OPTION),
			{ productId },
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);
		// console.log("cartOptionProductOptionList", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
