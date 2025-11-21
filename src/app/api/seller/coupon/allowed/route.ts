import API_URL from "@/api/endpoints";
import { getNormal, postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { GetSellerCouponAllowResponse, SetSellerCouponAllowRequest } from "@/types/seller";
import { NextResponse } from "next/server";

// 판매자 해당 쿠폰 허용제품 조회
export const GET = withAuth(async ({ nextRequest, userId }) => {
	try {
		const couponId = nextRequest.nextUrl.searchParams.get("couponId");
		if (!couponId) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });
		const data = await getNormal<GetSellerCouponAllowResponse>(getBackendUrl(API_URL.SELLER_COUPON_ALLOWED), { userId });
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: any) {
		console.error("error :", {
			message: err.message,
			status: err.status,
			data: err.data,
		});

		const status = Number.isInteger(err?.status) ? err.status : 500;
		const payload = err?.data && typeof err.data === "object" ? err.data : { message: err?.message || "SERVER_ERROR" };

		return NextResponse.json(payload, { status });
	}
});
// 판매자 해당 쿠폰 허용제품 변경
export const POST = withAuth(async ({ nextRequest, userId, params }) => {
	try {
		// json으로 받으면
		const { couponId, productIds } = await nextRequest.json();
		if (!couponId || !productIds || productIds.length === 0) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });

		const payload: SetSellerCouponAllowRequest = { couponId, productIds };
		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.SELLER_COUPON_ALLOWED), { ...payload });
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: any) {
		console.error("error :", {
			message: err.message,
			status: err.status,
			data: err.data,
		});

		const status = Number.isInteger(err?.status) ? err.status : 500;
		const payload = err?.data && typeof err.data === "object" ? err.data : { message: err?.message || "SERVER_ERROR" };

		return NextResponse.json(payload, { status });
	}
});
