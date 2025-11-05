import { getNormal } from "@/api/fetchFilter";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
	console.log(request.url);
	console.log(request.method);
	console.log(request.query);

	try {
		// method별 요청처리
		if (request.method === "") {
			const res = await getNormal("");
			if (res.status === 401) {
				return res.status(401).json({ msg: "아이디 또는 비밀번호가 올바르지 않습니다." });
			}
			if (!res.ok) {
				// Spring 에러 그대로 전달하지 말고 요약해서 반환
				console.error("Spring auth error:", await res.text());
				return response.status(502).json({ msg: "인증 서버 오류" });
			}
			return response.status(200).json({ msg: "success" });
		}

		return response.status(405).json({ msg: "Method not allowed" });
	} catch (error) {
		console.error("서버 통신 에러 :", error);
		return response.status(500).json({ msg: "서버 오류, 다시 시도해주세요." });
	}
}
