// 상품 확인 및 점유(장비구니, 상품상세보기에서 구매페이지이동 시)

import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { ExtendStockHoldRequest, ExtendStockHoldResponse } from "@/types/buy";
import { NextResponse } from "next/server";

// 상품 점유 연장
export const POST = withAuth(async ({ nextRequest, userId }) => {
	try {
		const { holdIds }: ExtendStockHoldRequest = await nextRequest.json();

		if (holdIds.length === 0) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });

		const payload: ExtendStockHoldRequest = { holdIds };
		const data = await postJson<ExtendStockHoldResponse, ExtendStockHoldRequest>(getBackendUrl(API_URL.BUY_HOLD_EXTENT), { ...payload });
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
