import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, postUrlFormData, putUrlFormData, RequestHeaders } from "@/api/fetchFilter";
import { userWithAuth, withOptionalAuth } from "@/lib/auth/user";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { AddProductQnaRequest, GetProductDetailQnaResponse, UpdateProductQnaRequest } from "@/types/product";
import { NextResponse } from "next/server";

// 제품 상세조회 Q&A 조회
export const GET = withOptionalAuth<{ productId: string }>(async ({ accessToken, params }) => {
	console.log("[API] 제품 상세조회 Q&A 조회");
	try {
		const productId = Number(params.productId);
		if (!productId || !Number.isInteger(productId)) return NextResponse.json({ message: "productId is required" }, { status: 400 });

		const headers: RequestHeaders = {};
		if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

		const data = await getNormal<GetProductDetailQnaResponse>(getBackendUrl(API_URL.PRODUCT_DETAIL_QNA), { productId }, headers);
		// console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
// 제품 상품 Q&A 작성
export const POST = userWithAuth<{ productId: string }>(async ({ nextRequest, accessToken, params }) => {
	console.log("[API] 제품 상품 Q&A 작성");
	try {
		const productId = Number(params.productId);
		const { question, productQnaTypeId, secret }: AddProductQnaRequest = await nextRequest.json();
		if (!productId || !question || !productQnaTypeId || secret === undefined)
			return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.PRODUCT_DETAIL_QNA),
			{ productId, question, productQnaTypeId, secret },
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
// 제품 상품 Q&A 수정
export const PUT = userWithAuth<{ productId: string }>(async ({ nextRequest, accessToken, params }) => {
	console.log("[API] 제품 상품 Q&A 수정");
	try {
		const productId = Number(params.productId);
		const { productQnaId, question, secret }: UpdateProductQnaRequest = await nextRequest.json();
		if (!productId || !productQnaId || !question || secret === undefined)
			return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const data = await putUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.PRODUCT_DETAIL_QNA),
			{ productId, productQnaId, question, secret },
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
