import API_URL from "@/api/endpoints";
import { postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 판매자 쿠폰 상태 변경
export const POST = withAuth(async ({ nextRequest }) => {
	try {
		// json으로 받으면
		const { couponId, status } = await nextRequest.json();
		if (!couponId || !status) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });

		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.SELLER_COUPON_STATUS), { couponId, status });
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
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
