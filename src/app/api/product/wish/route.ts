import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, postUrlFormData } from "@/api/fetchFilter";
import { userWithAuth } from "@/lib/auth/user";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 현재 회원 위시 productId 목록 조회
export const GET = userWithAuth(async ({ accessToken }) => {
	console.log("[API] 현재 회원 위시 productId 목록 조회");
	try {
		const data = await getNormal<BaseResponse & { wishProductIds: number[] }>(getBackendUrl(API_URL.PRODUCT_WISH), undefined, {
			Authorization: `Bearer ${accessToken}`,
		});
		// console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});

// 위시 등록/해제
export const POST = userWithAuth(async ({ nextRequest, accessToken }) => {
	console.log("[API] 위시 등록/해제");
	try {
		const { productId }: { productId: number } = await nextRequest.json();

		if (!productId) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.PRODUCT_WISH),
			{ productId },
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);
		// console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
