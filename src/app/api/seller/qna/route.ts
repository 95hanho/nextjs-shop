import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, postUrlFormData } from "@/api/fetchFilter";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetSellerQnaResponse, UpdateQnaAnswerRequest } from "@/types/seller";
import { NextResponse } from "next/server";
import { sellerWithAuth } from "@/lib/auth/seller";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { BaseResponse } from "@/types/common";

// 판매자 QnA 조회
export const GET = sellerWithAuth(async ({ sellerToken }) => {
	console.log("[API] 판매자 QnA 조회");
	try {
		const data = await getNormal<GetSellerQnaResponse>(getBackendUrl(API_URL.SELLER_QNA), undefined, {
			Authorization: `Bearer ${sellerToken}`,
		});
		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		console.error("[API ERROR] 판매자 QnA 조회 실패");
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
// 판매자 QnA 답변 등록/수정
export const POST = sellerWithAuth(async ({ sellerToken, nextRequest }) => {
	console.log("[API] 판매자 QnA 답변 등록/수정");
	try {
		const { productQnaId, answer }: UpdateQnaAnswerRequest = await nextRequest.json();
		if (!productQnaId || !answer) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.SELLER_QNA),
			{
				productQnaId,
				answer,
			},
			{
				Authorization: `Bearer ${sellerToken}`,
			},
		);
		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		console.error("[API ERROR] 판매자 QnA 답변 등록/수정 실패");
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
