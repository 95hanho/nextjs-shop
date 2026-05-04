import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { userWithAuth } from "@/lib/auth/user";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env.server";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 위시 여부 확인
export const GET = userWithAuth(async ({ nextRequest, accessToken }) => {
	console.log("[API] 위시 여부 확인");
	try {
		const productIdList = nextRequest.nextUrl.searchParams.getAll("productIdList").map(Number);
		if (!productIdList || productIdList.length === 0) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
		const data = await getNormal<BaseResponse & { checkedProductIdList: number[] }>(
			getBackendUrl(API_URL.PRODUCT_WISH_CHECK),
			{ productIdList },
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
