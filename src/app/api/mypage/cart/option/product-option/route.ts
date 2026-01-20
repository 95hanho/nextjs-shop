import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetCartOptionProductOptionListResponse } from "@/types/mypage";
import { NextResponse } from "next/server";

// 장바구니 제품 다른 option조회
export const GET = withAuth(async ({ nextRequest, accessToken }) => {
	// query 접근 (App Router에서는 req.nextUrl.searchParams)
	const search = Object.fromEntries(nextRequest.nextUrl.searchParams.entries());
	if (Object.keys(search).length > 0) {
		console.log("query:", search);
	}

	try {
		const productId = nextRequest.nextUrl.searchParams.get("productId");
		if (!productId) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });
		const data = await getNormal<GetCartOptionProductOptionListResponse>(
			getBackendUrl(API_URL.MY_CART_OPTION_PRODUCT_DETAIL),
			{ productId },
			{
				Authorization: `Bearer ${accessToken}`,
			}
		);
		// console.log("cartOptionProductOptionList", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
