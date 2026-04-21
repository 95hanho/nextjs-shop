import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { putUrlFormData } from "@/api/fetchFilter";
import { userWithAuth } from "@/lib/auth/user";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// Qna 답변 읽음 처리
export const PUT = userWithAuth<{ productId: string }>(async ({ nextRequest, accessToken, params }) => {
	console.log("[API] Qna 답변 읽음 처리");
	try {
		const productId = Number(params.productId);
		const { productQnaId } = await nextRequest.json();
		if (!productQnaId) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const data = await putUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.PRODUCT_DETAIL_QNA_READ),
			{ productId, productQnaId },
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
