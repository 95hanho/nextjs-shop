import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData } from "@/api/fetchFilter";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { sellerWithAuth } from "@/lib/auth/seller";
import { BaseResponse } from "@/types/common";
import { IssueCouponToUsersRequest } from "@/types/seller";
import { NextResponse } from "next/server";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";

// 쿠폰을 유저에게 발행하기
export const POST = sellerWithAuth(async ({ nextRequest, sellerToken }) => {
	console.log("[API] 쿠폰을 유저에게 발행하기");
	try {
		const { couponId, type }: IssueCouponToUsersRequest = await nextRequest.json();
		if (!couponId || !type) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: IssueCouponToUsersRequest = { couponId, type };
		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.SELLER_COUPON_USER_COUPON),
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
