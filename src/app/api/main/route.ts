import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { MainProductResponse } from "@/types/main";
import { NextResponse } from "next/server";

/*  */
export const GET = async () => {
	try {
		// 메인 상품리스트 가져오기
		const data = await getNormal<MainProductResponse>(getBackendUrl(API_URL.MAIN));
		return NextResponse.json({ message: data.message, productList: data.productList }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
};
