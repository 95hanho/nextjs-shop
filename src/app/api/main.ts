import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { MainProductResponse } from "@/types/main";
import { NextRequest, NextResponse } from "next/server";

/*  */
export default async function handler(nextRequest: NextRequest) {
	console.log("method :", nextRequest.method, "url :", nextRequest.url);
	// query 접근 (App Router에서는 req.nextUrl.searchParams)
	const search = Object.fromEntries(nextRequest.nextUrl.searchParams.entries());
	if (Object.keys(search).length > 0) {
		console.log("query:", search);
	}

	try {
		// method별 요청처리
		// 메인 메뉴목록 가져오기
		if (nextRequest.method === "GET") {
			const data = await getNormal<MainProductResponse>(getBackendUrl(API_URL.MAIN));
			// if (!res.ok) {
			// 	// Spring 에러 그대로 전달하지 말고 요약해서 반환
			// 	console.error("Spring auth error:", await res.text());
			// 	return response.status(502).json({ message: "인증 서버 오류" });
			// }
			// const data: MainProductResponse = await res.json();
			return NextResponse.json({ message: data.message, productList: data.productList }, { status: 200 });
		}
		return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
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
}
