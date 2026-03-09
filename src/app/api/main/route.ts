import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { MainProductResponse } from "@/types/main";
import { NextResponse } from "next/server";

// 메인 상품리스트 가져오기
export const GET = async () => {
	console.log("[API] 메인 상품리스트 가져오기");
	try {
		const data = await getNormal<MainProductResponse>(getBackendUrl(API_URL.MAIN));
		return NextResponse.json({ message: data.message, productList: data.productList }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
};
