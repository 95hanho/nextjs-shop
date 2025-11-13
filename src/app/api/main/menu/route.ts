import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { getServerUrl } from "@/lib/getBaseUrl";
import { MenuResponse } from "@/types/main";
import { NextRequest, NextResponse } from "next/server";

export async function GET(nextRequest: NextRequest) {
	console.log("url :", nextRequest.url);
	// query 접근 (App Router에서는 req.nextUrl.searchParams)
	const search = Object.fromEntries(nextRequest.nextUrl.searchParams.entries());
	if (Object.keys(search).length > 0) {
		console.log("query:", search);
	}

	try {
		// 메인 메뉴목록 가져오기
		const data = await getNormal<MenuResponse>(getServerUrl(API_URL.MAIN_MENU));
		// return response.status(200).json({ message: data.message, menuList: data.menuList });
		return NextResponse.json({ message: data.message, menuList: data.menuList }, { status: 200 });
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
