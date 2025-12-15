import API_URL from "@/api/endpoints";
import { deleteNormal, getNormal } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 장바구니 제품 삭제
export const DELETE = withAuth(async ({ nextRequest, userId, params }) => {
	try {
		const { cartId } = params ?? {};
		if (!userId) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });
		const data = await deleteNormal<BaseResponse>(getBackendUrl(API_URL.MY_CART_DELETE), { cartId });
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
