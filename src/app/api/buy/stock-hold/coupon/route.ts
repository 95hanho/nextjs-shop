import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postJson, putJson } from "@/api/fetchFilter";
import { userWithAuth } from "@/lib/auth/user";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { ManageBuyHoldCouponRequest } from "@/types/buy";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 점유 쿠폰 추가
export const POST = userWithAuth(async ({ nextRequest, accessToken }) => {
	console.log("[API] 점유 쿠폰 추가");
	try {
		const { holdCoupons }: ManageBuyHoldCouponRequest = await nextRequest.json();
		if (!holdCoupons || holdCoupons.length === 0) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const data = await postJson<BaseResponse, ManageBuyHoldCouponRequest>(
			getBackendUrl(API_URL.BUY_HOLD_COUPON),
			{ holdCoupons },
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);
		// console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});

// 점유 쿠폰 삭제
export const PUT = userWithAuth(async ({ nextRequest, accessToken }) => {
	console.log("[API] 점유 쿠폰 삭제");
	try {
		const { holdCoupons }: ManageBuyHoldCouponRequest = await nextRequest.json();
		if (!holdCoupons || holdCoupons.length === 0) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const data = await putJson<BaseResponse, ManageBuyHoldCouponRequest>(
			getBackendUrl(API_URL.BUY_HOLD_COUPON),
			{ holdCoupons },
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);
		// console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
