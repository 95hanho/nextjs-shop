import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData } from "@/api/fetchFilter";
import { sellerWithAuth } from "@/lib/auth/seller";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { UpdateCouponStatusRequest } from "@/types/seller";
import { NextResponse } from "next/server";

// 쿠폰 상태 변경
export const POST = sellerWithAuth(async ({ nextRequest, sellerToken }) => {
	console.log("[API] 쿠폰 상태 변경");
	try {
		// json으로 받으면
		const { activeCouponIds = [], suspendedCouponIds = [] }: UpdateCouponStatusRequest = await nextRequest.json();
		console.log("request body", { activeCouponIds, suspendedCouponIds });
		if (activeCouponIds.length === 0 && suspendedCouponIds.length === 0)
			return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: UpdateCouponStatusRequest = { activeCouponIds, suspendedCouponIds };
		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.SELLER_COUPON_STATUS),
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
