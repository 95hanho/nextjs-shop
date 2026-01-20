// 상품 확인 및 점유(장비구니, 상품상세보기에서 구매페이지이동 시)

import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postJson } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { ExtendStockHoldRequest, ExtendStockHoldResponse } from "@/types/buy";
import { NextResponse } from "next/server";

// 상품 점유 연장
export const POST = withAuth(async ({ nextRequest, accessToken }) => {
	try {
		const { holdIds }: ExtendStockHoldRequest = await nextRequest.json();

		if (holdIds.length === 0) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });

		const payload: ExtendStockHoldRequest = { holdIds };
		const data = await postJson<ExtendStockHoldResponse, ExtendStockHoldRequest>(
			getBackendUrl(API_URL.BUY_HOLD_EXTENT),
			{ ...payload },
			{
				Authorization: `Bearer ${accessToken}`,
			}
		);
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
