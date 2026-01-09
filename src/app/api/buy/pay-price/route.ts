import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { payPriceRequest, payPriceResponse } from "@/types/buy";
import { NextResponse } from "next/server";

// 상품 쿠폰, 마일리지, 배송비 여부의 변경에 따라 가격계산해서 보여줌.(결제 바로 전)
export const POST = withAuth(async ({ nextRequest, accessToken }) => {
	try {
		// json으로 받으면
		const { products, commonCoupon, useMileage }: payPriceRequest = await nextRequest.json();

		const payload: payPriceRequest = { products, commonCoupon, useMileage };
		const data = await postJson<payPriceResponse, payPriceRequest>(getBackendUrl(API_URL.BUY_PRICE), payload, {
			Authorization: `Bearer ${accessToken}`,
		});
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
