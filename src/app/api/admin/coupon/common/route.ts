import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, postUrlFormData, putUrlFormData } from "@/api/fetchFilter";
import { withAdminAuth } from "@/lib/admin/auth";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { AddCommonCouponRequest, GetCommonCouponListResponse, UpdateCommonCouponRequest } from "@/types/admin";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 공용 쿠폰 조회
export const GET = withAdminAuth(async ({ adminToken }) => {
	try {
		const data = await getNormal<GetCommonCouponListResponse>(getBackendUrl(API_URL.ADMIN_COUPON_COMMON), undefined, {
			Authorization: `Bearer ${adminToken}`,
		});
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
// 공용 쿠폰 등록
export const POST = withAdminAuth(async ({ nextRequest, adminToken }) => {
	try {
		const {
			description,
			discountType,
			discountValue,
			maxDiscount,
			minimumOrderBeforeAmount,
			amount,
			startDate,
			endDate,
		}: AddCommonCouponRequest = await nextRequest.json();
		if (!description || !discountType || !discountValue || !minimumOrderBeforeAmount || !amount || !startDate || !endDate)
			return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
		if (discountType === "percentage" && !maxDiscount) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: AddCommonCouponRequest = {
			description,
			discountType,
			discountValue,
			minimumOrderBeforeAmount,
			amount,
			startDate,
			endDate,
		};
		if (maxDiscount) payload.maxDiscount = maxDiscount;
		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.ADMIN_COUPON_COMMON),
			{ ...payload },
			{
				Authorization: `Bearer ${adminToken}`,
			},
		);
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
// 공용 쿠폰 수정
export const PUT = withAdminAuth(async ({ nextRequest, adminToken }) => {
	try {
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
		}: UpdateCommonCouponRequest = await nextRequest.json();
		if (couponId) return NextResponse.json({ message: "아이디를 입력해주세요." }, { status: 400 });
		if (
			!description ||
			!discountType ||
			!discountValue ||
			!minimumOrderBeforeAmount ||
			!status ||
			isStackable == null ||
			isProductRestricted == null ||
			!amount ||
			!startDate ||
			!endDate
		)
			return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
		if (discountType === "percentage" && !maxDiscount) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: UpdateCommonCouponRequest = {
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
			getBackendUrl(API_URL.ADMIN_COUPON_COMMON),
			{ ...payload },
			{
				Authorization: `Bearer ${adminToken}`,
			},
		);
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
