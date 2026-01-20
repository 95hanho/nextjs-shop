import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { MenuResponse } from "@/types/main";
import { NextResponse } from "next/server";

// 메인 메뉴목록 가져오기
export const GET = async () => {
	try {
		const data = await getNormal<MenuResponse>(getBackendUrl(API_URL.MAIN_MENU));
		// return response.status(200).json({ message: data.message, menuList: data.menuList });
		return NextResponse.json({ message: data.message, menuList: data.menuList }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
};
