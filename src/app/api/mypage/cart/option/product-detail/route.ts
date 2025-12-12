import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetCartOptionProductDetailListResponse } from "@/types/mypage";
import { NextResponse } from "next/server";

// 장바구니 제품 다른detail조회
export const GET = withAuth(async ({ nextRequest }) => {
	// query 접근 (App Router에서는 req.nextUrl.searchParams)
	const search = Object.fromEntries(nextRequest.nextUrl.searchParams.entries());
	if (Object.keys(search).length > 0) {
		console.log("query:", search);
	}

	try {
		const productId = nextRequest.nextUrl.searchParams.get("productId");
		if (!productId) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });
		const data = await getNormal<GetCartOptionProductDetailListResponse>(getBackendUrl(API_URL.MY_CART_OPTION_PRODUCT_DETAIL), { productId });
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: any) {
		console.error("error :", {
			message: err.message,
			status: err.status,
			data: err.data,
		});

		const status = Number.isInteger(err?.status) ? err.status : 500;
		const payload = err?.data && typeof err.data === "object" ? err.data : { message: err?.message || "SERVER_ERROR" };

		return NextResponse.json(payload, { status });
	}
});
