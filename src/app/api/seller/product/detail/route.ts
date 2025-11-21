import API_URL from "@/api/endpoints";
import { postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { AddSellerProductDetail, UpdateSellerProductDetail } from "@/types/seller";
import { NextResponse } from "next/server";

// 판매자 제품 상세 추가/수정
export const POST = withAuth(async ({ nextRequest }) => {
	try {
		// json으로 받으면
		const { productId, addPrice, stock, size, productDetailId } = await nextRequest.json();
		let payload: AddSellerProductDetail | UpdateSellerProductDetail;
		// 추가
		if (!productDetailId) {
			if (!productId || !addPrice || !stock || !size) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });
			payload = { productId, addPrice, stock, size };
		}
		// 수정
		else {
			if (!productDetailId || !addPrice || !stock) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });
			payload = { productDetailId, addPrice, stock };
		}

		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.SELLER_PRODUCT_DETAIL), { ...payload });
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
