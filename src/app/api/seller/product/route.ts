import API_URL from "@/api/endpoints";
import { getNormal, postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { AddSellerProductRequest, GetSellerProductListResponse, UpdateSellerProductRequest } from "@/types/seller";
import { NextResponse } from "next/server";

// 판매자 제품 조회
export const GET = withAuth(async ({ nextRequest, userId }) => {
	try {
		const sellerId = nextRequest.nextUrl.searchParams.get("sellerId");
		if (!sellerId) return NextResponse.json({ message: "판매자 아이디를 입력해주세요." }, { status: 400 });

		const data = await getNormal<GetSellerProductListResponse>(getBackendUrl(API_URL.SELLER_PRODUCT), { sellerId });
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
// 판매자 제품 추가/수정
export const POST = withAuth(async ({ nextRequest, userId, params }) => {
	try {
		const { productId, name, colorName, price, sellerId, saleStop, menuSubId } = await nextRequest.json();
		let payload: AddSellerProductRequest | UpdateSellerProductRequest;
		// 추가
		if (!productId) {
			if (!name || !colorName || !price || !sellerId || !menuSubId)
				return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });
			payload = { name, colorName, price, sellerId, menuSubId };
		}
		// 수정
		else {
			if (!productId || !name || !colorName || !price || !saleStop || !menuSubId)
				return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });
			payload = { productId, name, colorName, price, saleStop, menuSubId };
		}

		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.SELLER_PRODUCT), { ...payload });
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
