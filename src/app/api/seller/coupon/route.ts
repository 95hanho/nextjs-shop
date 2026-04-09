import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, postUrlFormData, putUrlFormData } from "@/api/fetchFilter";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { sellerWithAuth } from "@/lib/auth/seller";
import { BaseResponse } from "@/types/common";
import { AddCouponRequest, GetSellerCouponListResponse, UpdateCouponRequest } from "@/types/seller";
import { NextResponse } from "next/server";

// 쿠폰 조회
export const GET = sellerWithAuth(async ({ sellerToken }) => {
	console.log("[API] 쿠폰 조회");
	try {
		const data = await getNormal<GetSellerCouponListResponse>(getBackendUrl(API_URL.SELLER_COUPON), undefined, {
			Authorization: `Bearer ${sellerToken}`,
		});
		// console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
// 쿠폰 등록
export const POST = sellerWithAuth(async ({ nextRequest, sellerToken }) => {
	console.log("[API] 쿠폰 등록");
	try {
		// json으로 받으면
		const {
			description,
			discountType,
			discountValue,
			maxDiscount,
			minimumOrderBeforeAmount,
			isStackable,
			isProductRestricted,
			amount,
			startDate,
			endDate,
		}: AddCouponRequest = await nextRequest.json();
		if (
			!description ||
			!discountType ||
			!discountValue ||
			!minimumOrderBeforeAmount ||
			isStackable === undefined ||
			isProductRestricted === undefined ||
			!amount ||
			!startDate ||
			!endDate
		)
			return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: AddCouponRequest = {
			description,
			discountType,
			discountValue,
			minimumOrderBeforeAmount,
			isStackable,
			isProductRestricted,
			amount,
			startDate,
			endDate: endDate,
		};
		if (maxDiscount) payload.maxDiscount = maxDiscount;
		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.SELLER_COUPON),
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
// 쿠폰 수정
export const PUT = sellerWithAuth(async ({ nextRequest, sellerToken }) => {
	console.log("[API] 쿠폰 수정");
	try {
		// json으로 받으면
		const {
			couponId,
			description,
			discountType,
			discountValue,
			maxDiscount,
			minimumOrderBeforeAmount,
			status,
			isStackable,
			isProductRestricted,
			amount,
			startDate,
			endDate,
		}: UpdateCouponRequest = await nextRequest.json();
		if (
			couponId === undefined ||
			!description ||
			!discountType ||
			!discountValue ||
			!minimumOrderBeforeAmount ||
			!status ||
			isStackable === undefined ||
			isProductRestricted === undefined ||
			!amount ||
			!startDate ||
			!endDate
		)
			return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: UpdateCouponRequest = {
			couponId,
			description,
			discountType,
			discountValue,
			minimumOrderBeforeAmount,
			status,
			isStackable,
			isProductRestricted,
			amount,
			startDate,
			endDate,
		};
		if (maxDiscount) payload.maxDiscount = maxDiscount;
		const data = await putUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.SELLER_COUPON),
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
