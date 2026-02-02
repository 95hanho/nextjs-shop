import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { deleteNormal } from "@/api/fetchFilter";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { withSellerAuth } from "@/lib/seller/auth";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 쿠폰 삭제
export const DELETE = withSellerAuth<{ couponId: string }>(async ({ params, sellerToken }) => {
	try {
		const couponId = Number(params.couponId);
		if (!couponId && couponId <= 0 && !Number.isInteger(couponId)) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
		const data = await deleteNormal<BaseResponse>(
			getBackendUrl(API_URL.SELLER_COUPON_DELETE),
			{ couponId },
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
