import API_URL from "@/api/endpoints";
import { postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { AddCartRequest } from "@/types/product";
import { NextResponse } from "next/server";

// 장바구니 넣기
export const POST = withAuth(async ({ nextRequest, userId }) => {
	try {
		const { productDetailId, quantity } = await nextRequest.json();
		if (!productDetailId || !userId || !quantity) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });

		const payload: AddCartRequest = { productDetailId, quantity, userId };
		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.PRODUCT_CART), { ...payload });
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
