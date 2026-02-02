import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, postUrlFormData } from "@/api/fetchFilter";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { withSellerAuth } from "@/lib/seller/auth";
import { BaseResponse } from "@/types/common";
import { AddCouponRequest, GetSellerCouponListResponse, UpdateCouponRequest } from "@/types/seller";
import { NextResponse } from "next/server";

// 쿠폰 조회
export const GET = withSellerAuth(async ({ nextRequest, sellerToken }) => {
	try {
		const sellerId = nextRequest.nextUrl.searchParams.get("sellerId");
		if (!sellerId) return NextResponse.json({ message: "판매자 아이디를 입력해주세요." }, { status: 400 });

		const data = await getNormal<GetSellerCouponListResponse>(
			getBackendUrl(API_URL.SELLER_COUPON),
			{ sellerId },
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
// 쿠폰 등록
export const POST = withSellerAuth(async ({ nextRequest, sellerToken }) => {
	try {
		// json으로 받으면
		const { description, discountType, discountValue, maxDiscount, minimumOrderBeforeAmount, amount, startDate, endDate }: AddCouponRequest =
			await nextRequest.json();
		if (!description || !discountType || !discountValue || !maxDiscount || !minimumOrderBeforeAmount || !amount || !startDate || !endDate)
			return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: AddCouponRequest = {
			description,
			discountType,
			discountValue,
			maxDiscount,
			amount,
			startDate: startDate.replace(/\//g, "-"),
			endDate: endDate.replace(/\//g, "-"),
		};
		if (minimumOrderBeforeAmount) payload.minimumOrderBeforeAmount = minimumOrderBeforeAmount;
		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.SELLER_COUPON),
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
// 쿠폰 수정
export const PUT = withSellerAuth(async ({ nextRequest, sellerToken }) => {
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
		if (!description || !discountType || !discountValue || !maxDiscount || !minimumOrderBeforeAmount || !amount || !startDate || !endDate)
			return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: UpdateCouponRequest = {
			couponId,
			description,
			discountType,
			discountValue,
			maxDiscount,
			status,
			isStackable,
			isProductRestricted,
			amount,
			startDate: startDate.replace(/\//g, "-"),
			endDate: endDate.replace(/\//g, "-"),
		};
		if (minimumOrderBeforeAmount) payload.minimumOrderBeforeAmount = minimumOrderBeforeAmount;
		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.SELLER_COUPON),
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
