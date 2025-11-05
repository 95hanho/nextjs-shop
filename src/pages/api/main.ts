import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { getServerUrl } from "@/lib/getBaseUrl";
import { MainProductResponse } from "@/types/main";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
	console.log(request.url);
	console.log(request.method);
	console.log(request.query);

	try {
		// 메인 메뉴목록 가져오기
		if (request.method === "GET") {
			const data = await getNormal<MainProductResponse>(getServerUrl() + API_URL.MAIN);
			// if (!res.ok) {
			// 	// Spring 에러 그대로 전달하지 말고 요약해서 반환
			// 	console.error("Spring auth error:", await res.text());
			// 	return response.status(502).json({ msg: "인증 서버 오류" });
			// }
			// const data: MainProductResponse = await res.json();
			return response.status(200).json({ msg: "success", productList: data.productList });
		}

		return response.status(405).json({ msg: "Method not allowed" });
	} catch (error) {
		console.error("서버 통신 에러 :", error);
		return response.status(500).json({ msg: "서버 오류, 다시 시도해주세요." });
	}
}
