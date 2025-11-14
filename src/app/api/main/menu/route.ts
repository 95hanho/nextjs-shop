import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getServerUrl } from "@/lib/getBaseUrl";
import { MenuResponse } from "@/types/main";
import { NextResponse } from "next/server";

// 메인 메뉴목록 가져오기
export const GET = withAuth(async () => {
	try {
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
});
