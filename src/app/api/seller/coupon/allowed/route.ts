import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, postUrlFormData } from "@/api/fetchFilter";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { sellerWithAuth } from "@/lib/auth/seller";
import { BaseResponse } from "@/types/common";
import { GetSellerCouponAllowResponse, SetSellerCouponAllowRequest } from "@/types/seller";
import { NextResponse } from "next/server";

// 쿠폰 허용제품 조회
export const GET = sellerWithAuth(async ({ nextRequest, sellerToken }) => {
	console.log("[API] 쿠폰 허용제품 조회");
	try {
		const couponId = nextRequest.nextUrl.searchParams.get("couponId");
		if (!couponId) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const data = await getNormal<GetSellerCouponAllowResponse>(
			getBackendUrl(API_URL.SELLER_COUPON_ALLOWED),
			{
				couponId: Number(couponId),
			},
			{
				Authorization: `Bearer ${sellerToken}`,
			},
		);
		// console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
// 쿠폰 허용제품 변경
export const POST = sellerWithAuth(async ({ nextRequest, sellerToken }) => {
	console.log("[API] 쿠폰 허용제품 변경");
	try {
		// json으로 받으면
		const { couponId, addProductIds = [], removeProductIds = [] }: SetSellerCouponAllowRequest = await nextRequest.json();
		console.log("request body", { couponId, addProductIds, removeProductIds });
		if (!couponId || (addProductIds.length === 0 && removeProductIds.length === 0))
			return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: SetSellerCouponAllowRequest = { couponId, addProductIds, removeProductIds };
		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.SELLER_COUPON_ALLOWED),
			{ ...payload },
			{
				Authorization: `Bearer ${sellerToken}`,
			},
		);
		// console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
