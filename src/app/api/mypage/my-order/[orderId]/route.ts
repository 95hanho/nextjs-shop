import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { MyOrderDetailResponse } from "@/types/mypage";
import { NextResponse } from "next/server";

// 주문배송정보 상세조회
export const GET = withAuth<{ orderId: string }>(async ({ accessToken, params }) => {
	try {
		const orderId = Number(params.orderId);

		const data = await getNormal<MyOrderDetailResponse>(
			getBackendUrl(API_URL.MY_ORDER_DETAIL),
			{ orderId },
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
