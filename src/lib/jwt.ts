import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "./tokenTime";
import { Token } from "@/types/auth";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret"; // 환경변수에 설정하세요
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// accessToken 생성
export function generateAccessToken(payload: { userId: string }) {
	return jwt.sign({ type: "access", ...payload }, JWT_SECRET, {
		expiresIn: ACCESS_TOKEN_EXPIRES_IN,
		algorithm: "HS256",
	});
}
// refreshToken 생성
export function generateRefreshToken() {
	return jwt.sign({ type: "refresh" }, JWT_SECRET, {
		expiresIn: REFRESH_TOKEN_EXPIRES_IN,
		algorithm: "HS256",
	});
}
// 일반 page/api 상에서의 토큰 복호화
export function verifyToken(token: string): Token {
	return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as Token; // 실패 시 오류 발생
}

// middleware는 Edge Runtime에서 동작 => nodejs환경 jsonwebtoken이 작동안함.
// middleware 환경에서의 토큰 복호화
export async function middleware_verifyToken(token: string): Promise<Token> {
	try {
		const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
		return payload as Token;
	} catch (err) {
		console.error("Token verify failed", err);
		throw err;
	}
}
