import API_URL from "@/api/endpoints";
import { deleteNormal, getNormal, postUrlFormData, putUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { GetCartResponse, UpdateCartRequest, UpdateCartSelectedRequest } from "@/types/mypage";
import { SYSTEM_ENTRYPOINTS } from "next/dist/shared/lib/constants";
import { NextResponse } from "next/server";

// 장바구니 조회
export const GET = withAuth(async ({ nextRequest, userId }) => {
	try {
		if (!userId) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });
		const data = await getNormal<GetCartResponse>(getBackendUrl(API_URL.MY_CART), { userId });
		// console.log("data", data);

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
// 장바구니 제품 옵션/수량 변경
export const POST = withAuth(async ({ nextRequest }) => {
	try {
		const { cartId, productDetailId, quantity }: UpdateCartRequest = await nextRequest.json();
		if (!cartId || !quantity) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });

		const payload: UpdateCartRequest = { cartId, productDetailId, quantity };
		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.MY_CART), { ...payload });
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
// 장바구니 제품 선택여부 변경
export const PUT = withAuth(async ({ nextRequest, accessToken }) => {
	try {
		const { cartIdList, selected }: UpdateCartSelectedRequest = await nextRequest.json();
		if (!cartIdList?.length || selected === undefined) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });

		const payload: UpdateCartSelectedRequest = { cartIdList, selected };
		const data = await putUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.MY_CART),
			{ ...payload },
			{
				Authorization: `Bearer ${accessToken}`,
			}
		);
		// console.log("data", data);

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
// 장바구니 제품 삭제
export const DELETE = withAuth(async ({ nextRequest, userId, params }) => {
	try {
		const cartIdList = nextRequest.nextUrl.searchParams.getAll("cartIdList").map(Number);
		if (!userId || !cartIdList?.length) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });
		console.log(cartIdList);
		const data = await deleteNormal<BaseResponse>(getBackendUrl(API_URL.MY_CART), { cartIdList });
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
