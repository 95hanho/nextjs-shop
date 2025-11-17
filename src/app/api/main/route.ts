import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { MainProductResponse } from "@/types/main";
import { NextResponse } from "next/server";

/*  */
export const GET = withAuth(async () => {
	try {
		// 메인 상품리스트 가져오기
		const data = await getNormal<MainProductResponse>(getBackendUrl(API_URL.MAIN));
		// if (!res.ok) {
		// 	// Spring 에러 그대로 전달하지 말고 요약해서 반환
		// 	console.error("Spring auth error:", await res.text());
		// 	return response.status(502).json({ message: "인증 서버 오류" });
		// }
		// const data: MainProductResponse = await res.json();
		return NextResponse.json({ message: data.message, productList: data.productList }, { status: 200 });
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
