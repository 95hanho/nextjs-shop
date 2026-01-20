import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { IssueCouponsToUsersRequest } from "@/types/seller";
import { NextResponse } from "next/server";

// 해당 쿠폰을 유저에게 발행하기
export const POST = withAuth(async ({ nextRequest }) => {
	try {
		const { couponId, userIds } = await nextRequest.json();
		if (!couponId || !userIds || userIds.length === 0) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });

		const payload: IssueCouponsToUsersRequest = { couponId, userIds };
		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.SELLER_COUPON_USER_COUPON), { ...payload });
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
