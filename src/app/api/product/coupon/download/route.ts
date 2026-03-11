import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData } from "@/api/fetchFilter";
import { userWithAuth } from "@/lib/auth/user";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 쿠폰 다운로드
export const POST = userWithAuth(async ({ nextRequest, accessToken }) => {
	console.log("[API] 쿠폰 다운로드");
	try {
		const { couponId } = await nextRequest.json();
		if (!couponId) return NextResponse.json({ message: "쿠폰 ID를 입력해주세요." }, { status: 400 });
		const data = await postUrlFormData<BaseResponse & { userCouponId: number }>(
			getBackendUrl(API_URL.PRODUCT_COUPON_DOWNLOAD),
			{ couponId },
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
