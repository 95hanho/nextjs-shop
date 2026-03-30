import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { userWithAuth } from "@/lib/auth/user";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { MyOrderListResponse } from "@/types/mypage";
import { NextResponse } from "next/server";

// 주문배송정보 조회
export const GET = userWithAuth(async ({ accessToken, nextRequest }) => {
	console.log("[API] 주문배송정보 조회");
	try {
		const keyword = nextRequest.nextUrl.searchParams.get("keyword");
		const payload: { keyword?: string } = {};
		if (keyword) payload.keyword = keyword;
		const data = await getNormal<MyOrderListResponse>(
			getBackendUrl(API_URL.MY_ORDER),
			{ ...payload },
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);
		// console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
