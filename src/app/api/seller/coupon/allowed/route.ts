import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, postUrlFormData } from "@/api/fetchFilter";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { withSellerAuth } from "@/lib/seller/auth";
import { BaseResponse } from "@/types/common";
import { GetSellerCouponAllowResponse, SetSellerCouponAllowRequest } from "@/types/seller";
import { NextResponse } from "next/server";

// 쿠폰 허용제품 조회
export const GET = withSellerAuth(async ({ sellerToken }) => {
	try {
		const data = await getNormal<GetSellerCouponAllowResponse>(getBackendUrl(API_URL.SELLER_COUPON_ALLOWED), undefined, {
			Authorization: `Bearer ${sellerToken}`,
		});
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
// 쿠폰 허용제품 변경
export const POST = withSellerAuth(async ({ nextRequest, sellerToken }) => {
	try {
		// json으로 받으면
		const { couponId, productIds, allow }: SetSellerCouponAllowRequest = await nextRequest.json();
		if (!couponId || !productIds || productIds.length === 0 || !allow)
			return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: SetSellerCouponAllowRequest = { couponId, productIds, allow };
		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.SELLER_COUPON_ALLOWED),
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
