import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { userWithAuth } from "@/lib/auth/user";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { UserCouponResponse } from "@/types/mypage";
import { NextResponse } from "next/server";

// 유저 쿠폰 조회
export const GET = userWithAuth(async ({ accessToken }) => {
	console.log("[API] 유저 쿠폰 조회");
	try {
		const data = await getNormal<UserCouponResponse>(getBackendUrl(API_URL.MY_USER_COUPON), undefined, {
			Authorization: `Bearer ${accessToken}`,
		});
		// console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
