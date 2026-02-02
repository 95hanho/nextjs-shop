import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData } from "@/api/fetchFilter";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { withSellerAuth } from "@/lib/seller/auth";
import { BaseResponse } from "@/types/common";
import { IssueCouponsToUsersRequest } from "@/types/seller";
import { NextResponse } from "next/server";

// 쿠폰을 유저에게 발행하기(개발필요)
export const POST = withSellerAuth(async ({ nextRequest }) => {
	try {
		const { couponId, userIds } = await nextRequest.json();
		if (!couponId || !userIds || userIds.length === 0) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: IssueCouponsToUsersRequest = { couponId, userIds };
		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.SELLER_COUPON_USER_COUPON), { ...payload });
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
