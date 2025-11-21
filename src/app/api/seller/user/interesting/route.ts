import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetSellerInterestingUserResponse } from "@/types/seller";
import { NextResponse } from "next/server";

// 판매자와 관련된 회원 조회
export const GET = withAuth(async ({ nextRequest, userId, params }) => {
	try {
		const sellerId = nextRequest.nextUrl.searchParams.get("sellerId");
		if (!sellerId) return NextResponse.json({ message: "판매자 아이디를 입력해주세요." }, { status: 400 });
		const data = await getNormal<GetSellerInterestingUserResponse>(getBackendUrl(API_URL.SELLER_INTERESTING_USER), { sellerId });
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
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
