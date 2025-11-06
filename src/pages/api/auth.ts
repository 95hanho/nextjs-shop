import API_URL from "@/api/endpoints";
import { getNormal, postUrlFormData } from "@/api/fetchFilter";
import { getServerUrl } from "@/lib/getBaseUrl";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { ACCESS_TOKEN_COOKIE_AGE, REFRESH_TOKEN_COOKIE_AGE } from "@/lib/tokenTime";
import { loginResponse } from "@/types/auth";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
	console.log(request.url);
	console.log(request.method);
	console.log(request.query);

	try {
		// 회원정보가져오기
		if (request.method === "GET") {
		}
		// 로그인
		if (request.method === "POST") {
			const { userId, password } = request.body;
			if (!userId) response.status(400).json({ msg: "아이디를 입력해주세요." });
			if (!password) response.status(400).json({ msg: "비밀번호를 입력해주세요." });

			const data = await postUrlFormData<loginResponse>(getServerUrl() + API_URL.USER, { userId, password });
			// if (res.status === 401) {
			// 	return res.status(401).json({ msg: "아이디 또는 비밀번호가 올바르지 않습니다." });
			// }
			// if (!res.ok) {
			// 	// Spring 에러 그대로 전달하지 말고 요약해서 반환
			// 	console.error("Spring auth error:", await res.text());
			// 	return response.status(502).json({ msg: "인증 서버 오류" });
			// }
			// ✅ HttpOnly 쿠키 설정
			const accessToken = generateAccessToken({ userId });
			const refreshToken = generateRefreshToken();

			console.log("accessToken", accessToken, "refreshToken", refreshToken);

			console.log(data);
			response.setHeader("Set-Cookie", [
				`accessToken=${accessToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${ACCESS_TOKEN_COOKIE_AGE}`,
				`refreshToken=${refreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${REFRESH_TOKEN_COOKIE_AGE}`,
			]);
			return response.status(200).json({ msg: "success login" });
			// return 응답.status(res.status).json({ msg: "로그인 실패", status: res.status });
		}
		return response.status(405).json({ msg: "Method not allowed" });
	} catch (err: any) {
		console.error("서버 통신 에러 :", {
			message: err.message,
			status: err.status,
			data: err.data,
		});

		const status = Number.isInteger(err?.status) ? err.status : 500;
		const payload = err?.data && typeof err.data === "object" ? err.data : { msg: err?.message || "SERVER_ERROR" };

		return response.status(status).json(payload);
	}
}
