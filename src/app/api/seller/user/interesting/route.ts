import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { sellerWithAuth } from "@/lib/auth/seller";
import { GetSellerInterestingUserResponse } from "@/types/seller";
import { NextResponse } from "next/server";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";

// 판매자와 관련된 회원 조회
export const GET = sellerWithAuth(async ({ sellerToken, nextRequest }) => {
	console.log("[API] 판매자와 관련된 회원 조회");
	try {
		const couponId = nextRequest.nextUrl.searchParams.get("couponId");
		if (!couponId) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const data = await getNormal<GetSellerInterestingUserResponse>(
			getBackendUrl(API_URL.SELLER_INTERESTING_USER),
			{
				couponId: Number(couponId),
			},
			{
				Authorization: `Bearer ${sellerToken}`,
			},
		);
		// console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
