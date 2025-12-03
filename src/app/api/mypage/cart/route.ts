import API_URL from "@/api/endpoints";
import { getNormal, postUrlFormData, putUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { GetCartResponse, UpdateCartRequest, UpdateCartSelectedRequest } from "@/types/mypage";
import { NextResponse } from "next/server";

// 장바구니 조회
export const GET = withAuth(async ({ nextRequest, userId }) => {
	try {
		if (!userId) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });
		const data = await getNormal<GetCartResponse>(getBackendUrl(API_URL.MY_CART), { userId });
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
// 장바구니 제품 수량/선택여부 변경
export const POST = withAuth(async ({ nextRequest }) => {
	try {
		const { quantity, cartId }: UpdateCartRequest = await nextRequest.json();
		if (!cartId || !quantity) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });

		const payload: UpdateCartRequest = { quantity, cartId };
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
export const PUT = withAuth(async ({ nextRequest }) => {
	try {
		const { cartIdList, selected }: UpdateCartSelectedRequest = await nextRequest.json();
		if (!cartIdList || !cartIdList.length || selected === undefined)
			return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });

		const payload: UpdateCartSelectedRequest = { cartIdList, selected };
		const data = await putUrlFormData<BaseResponse>(getBackendUrl(API_URL.MY_CART), { ...payload });
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
