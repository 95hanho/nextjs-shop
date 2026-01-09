import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { MyOrderDetailResponse } from "@/types/mypage";
import { NextResponse } from "next/server";

// 주문배송정보 상세조회
export const GET = withAuth(async ({ accessToken, params }) => {
	try {
		const { orderId } = params ?? {};

		const data = await getNormal<MyOrderDetailResponse>(
			getBackendUrl(API_URL.MY_ORDER_DETAIL),
			{ orderId },
			{
				Authorization: `Bearer ${accessToken}`,
			}
		);
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
