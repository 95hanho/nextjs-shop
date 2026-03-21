import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData } from "@/api/fetchFilter";
import { userWithAuth } from "@/lib/auth/user";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BuyHoldCouponRequest } from "@/types/buy";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 점유 쿠폰 추가/삭제
export const POST = userWithAuth(async ({ nextRequest, accessToken }) => {
	console.log("[API] 점유 쿠폰 추가/삭제");
	try {
		const body: BuyHoldCouponRequest = await nextRequest.json();
		if (body.isAdd === undefined) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
		// 추가
		if (body.isAdd) {
			if (!body.holdId || !body.userCouponId) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
		}
		// 삭제
		else {
			if (!body.holdCouponId) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
		}

		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.BUY_HOLD_COUPON),
			{ ...body },
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
