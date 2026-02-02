import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { withSellerAuth } from "@/lib/seller/auth";
import { GetSellerInterestingUserResponse } from "@/types/seller";
import { NextResponse } from "next/server";

// 판매자와 관련된 회원 조회
export const GET = withSellerAuth(async ({ nextRequest, userId, params }) => {
	try {
		const sellerId = nextRequest.nextUrl.searchParams.get("sellerId");
		if (!sellerId) return NextResponse.json({ message: "판매자 아이디를 입력해주세요." }, { status: 400 });
		const data = await getNormal<GetSellerInterestingUserResponse>(getBackendUrl(API_URL.SELLER_INTERESTING_USER), { sellerId });
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
