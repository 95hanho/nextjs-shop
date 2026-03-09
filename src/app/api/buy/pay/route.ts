import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, postJson, postUrlFormData } from "@/api/fetchFilter";
import { userWithAuth } from "@/lib/auth/user";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { getStockHoldProductResponse, payRequest } from "@/types/buy";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

/*  */
// 점유 중인 상품 및 사용 가능 쿠폰 조회(결제화면)
export const GET = userWithAuth(async ({ accessToken }) => {
	console.log("[API] 점유 중인 상품 및 사용 가능 쿠폰 조회(결제화면)");
	try {
		const data = await getNormal<getStockHoldProductResponse>(getBackendUrl(API_URL.BUY_PAY), undefined, {
			Authorization: `Bearer ${accessToken}`,
		});
		// console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
// 상품 구매/결제
export const POST = userWithAuth(async ({ nextRequest, accessToken }) => {
	console.log("[API] 상품 구매/결제");
	try {
		const {
			items,
			eachCouponDiscountTotal,
			commonCouponDiscountTotal,
			shippingFee,
			usedMileage,
			remainingMileague,
			totalFinal,
			paymentMethod,
			userCouponId,
			addressId,
		}: payRequest = await nextRequest.json();
		const payload: payRequest = {
			items,
			eachCouponDiscountTotal,
			commonCouponDiscountTotal,
			shippingFee,
			usedMileage,
			remainingMileague,
			totalFinal,
			paymentMethod,
			userCouponId,
			addressId,
		};
		const data = await postJson<BaseResponse>(getBackendUrl(API_URL.AUTH), payload, {
			Authorization: `Bearer ${accessToken}`,
		});
		// console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
