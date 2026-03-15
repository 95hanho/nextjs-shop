// 상품 확인 및 점유(장비구니, 상품상세보기에서 구매페이지이동 시)

import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postJson } from "@/api/fetchFilter";
import { userWithAuth } from "@/lib/auth/user";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { ExtendStockHoldResponse } from "@/types/buy";
import { NextResponse } from "next/server";

// 상품 점유 연장
export const POST = userWithAuth(async ({ accessToken }) => {
	console.log("[API] 상품 점유 연장");
	try {
		const data = await postJson<ExtendStockHoldResponse>(getBackendUrl(API_URL.BUY_HOLD_EXTEND), undefined, {
			Authorization: `Bearer ${accessToken}`,
		});
		// console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
