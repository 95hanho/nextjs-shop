import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { getServerUrl } from "@/lib/getBaseUrl";
import { MenuResponse } from "@/types/main";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
	console.log(request.url);
	console.log(request.method);
	console.log(request.query);

	try {
		// 메인 메뉴목록 가져오기
		if (request.method === "GET") {
			const data = await getNormal<MenuResponse>(getServerUrl() + API_URL.MAIN_MENU);
			return response.status(200).json({ msg: "success", menuList: data.menuList });
		}

		return response.status(400).json({ msg: "잘 못 된 요청입니다." });
	} catch (error) {
		console.error("서버 통신 에러 :", error);
		return response.status(500).json({ msg: "서버 오류, 다시 시도해주세요." });
	}
}
