import API_URL from "@/api/endpoints";
import { getNormal, postUrlFormData } from "@/api/fetchFilter";
import { getServerUrl } from "@/lib/getBaseUrl";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { ACCESS_TOKEN_COOKIE_AGE, REFRESH_TOKEN_COOKIE_AGE } from "@/lib/tokenTime";
import { loginResponse } from "@/types/auth";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(nextRequest: NextApiRequest, nextResponse: NextApiResponse) {
	console.log(nextRequest.url);
	console.log(nextRequest.method);
	console.log(nextRequest.query);

	try {
		// 회원정보가져오기
		if (nextRequest.method === "GET") {
		}
		// 로그인
		if (nextRequest.method === "POST") {
			const { userId, password } = nextRequest.body;
			if (!userId) return nextResponse.status(400).json({ message: "아이디를 입력해주세요." });
			if (!password) return nextResponse.status(400).json({ message: "비밀번호를 입력해주세요." });

			const data = await postUrlFormData<loginResponse>(getServerUrl() + API_URL.USER, { userId, password });
			console.log("data", data);
			/* 에러는 FE에서 처리 */
			// if (res.status === 401) {
			// 	return res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
			// }
			// if (!res.ok) {
			// 	// Spring 에러 그대로 전달하지 말고 요약해서 반환
			// 	console.error("Spring auth error:", await res.text());
			// 	return response.status(502).json({ message: "인증 서버 오류" });
			// }
			// ✅ HttpOnly 쿠키 설정
			const accessToken = generateAccessToken({ userId });
			const refreshToken = generateRefreshToken();

			console.log("accessToken", accessToken, "refreshToken", refreshToken);
			nextResponse.setHeader("Set-Cookie", [
				`accessToken=${accessToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${ACCESS_TOKEN_COOKIE_AGE}`,
				`refreshToken=${refreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${REFRESH_TOKEN_COOKIE_AGE}`,
			]);
			return nextResponse.status(200).json({ message: "success login" });
		}
		return nextResponse.status(405).json({ message: "Method not allowed" });
	} catch (err: any) {
		console.error("error :", {
			message: err.message,
			status: err.status,
			data: err.data,
		});

		const status = Number.isInteger(err?.status) ? err.status : 500;
		const payload = err?.data && typeof err.data === "object" ? err.data : { message: err?.message || "SERVER_ERROR" };

		return nextResponse.status(status).json(payload);
	}
}
