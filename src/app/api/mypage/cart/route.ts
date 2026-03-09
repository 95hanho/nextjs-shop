import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { deleteNormal, getNormal, postUrlFormData, putUrlFormData } from "@/api/fetchFilter";
import { userWithAuth } from "@/lib/auth/user";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { GetCartResponse, UpdateCartRequest, UpdateCartSelectedRequest } from "@/types/mypage";
import { NextResponse } from "next/server";

// 장바구니 조회
export const GET = userWithAuth(async ({ accessToken }) => {
	console.log("[API] 장바구니 조회");
	try {
		const data = await getNormal<GetCartResponse>(getBackendUrl(API_URL.MY_CART), undefined, {
			Authorization: `Bearer ${accessToken}`,
		});
		// console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
// 장바구니 제품 옵션/수량 변경
export const POST = userWithAuth(async ({ nextRequest, accessToken }) => {
	console.log("[API] 장바구니 제품 옵션/수량 변경");
	try {
		const { cartId, productOptionId, quantity }: UpdateCartRequest = await nextRequest.json();
		if (!cartId || !productOptionId || !quantity) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: UpdateCartRequest = { cartId, productOptionId, quantity };
		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.MY_CART),
			{ ...payload },
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
// 장바구니 제품 선택여부 변경
export const PUT = userWithAuth(async ({ nextRequest, accessToken }) => {
	console.log("[API] 장바구니 제품 선택여부 변경");
	try {
		const { cartIdList, selected }: UpdateCartSelectedRequest = await nextRequest.json();
		if (!cartIdList?.length || selected === undefined) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: UpdateCartSelectedRequest = { cartIdList, selected };
		const data = await putUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.MY_CART),
			{ ...payload },
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
// 장바구니 제품 삭제
export const DELETE = userWithAuth(async ({ nextRequest, accessToken }) => {
	console.log("[API] 장바구니 제품 삭제");
	try {
		const cartIdList = nextRequest.nextUrl.searchParams.getAll("cartIdList").map(Number);
		if (!cartIdList || !cartIdList?.length) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
		// console.log(cartIdList);
		const data = await deleteNormal<BaseResponse>(
			getBackendUrl(API_URL.MY_CART),
			{ cartIdList },
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);
		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
