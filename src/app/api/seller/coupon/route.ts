import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { AddCoupnRequest, GetSellerCouponListResponse } from "@/types/seller";
import { NextResponse } from "next/server";

// 판매자 쿠폰 조회
export const GET = withAuth(async ({ nextRequest }) => {
	try {
		const sellerId = nextRequest.nextUrl.searchParams.get("sellerId");
		if (!sellerId) return NextResponse.json({ message: "판매자 아이디를 입력해주세요." }, { status: 400 });

		const data = await getNormal<GetSellerCouponListResponse>(getBackendUrl(API_URL.SELLER_COUPON), { sellerId });
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
// 판매자 쿠폰 등록
export const POST = withAuth(async ({ nextRequest, userId, params }) => {
	try {
		// json으로 받으면
		const {
			description,
			couponCode,
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
			sellerId,
		} = await nextRequest.json();
		if (!sellerId) return NextResponse.json({ message: "판매자 아이디를 입력해주세요." }, { status: 400 });
		if (
			!description ||
			!couponCode ||
			!discountType ||
			!discountValue ||
			!maxDiscount ||
			!minimumOrderBeforeAmount ||
			!status ||
			!isStackable ||
			!isProductRestricted ||
			!amount ||
			!startDate ||
			!endDate
		)
			return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: AddCoupnRequest = {
			description,
			couponCode,
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
			sellerId,
		};
		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.SELLER_COUPON), { ...payload });
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
