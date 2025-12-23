import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";
import { ACCESS_TOKEN_EXPIRES_IN, PHONE_AUTH_EXPIRES_IN, PWD_CHANGE_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "./tokenTime";
import { Token } from "@/types/auth";
import type { StringValue } from "ms";

const NEXT_PUBLIC_JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || "your-secret"; // 환경변수에 설정하세요
const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
const NEXT_PUBLIC_PHONE_AUTH = process.env.NEXT_PUBLIC_PHONE_AUTH || "your-secret";
const NEXT_PUBLIC_PWD_CHANGE = process.env.NEXT_PUBLIC_PWD_CHANGE || "your-secret";

// accessToken 생성
export function generateAccessToken(payload: { userId: string }, expiresIn?: StringValue) {
	return jwt.sign({ type: "access", userId: payload.userId }, NEXT_PUBLIC_JWT_SECRET, {
		expiresIn: expiresIn || ACCESS_TOKEN_EXPIRES_IN,
		algorithm: "HS256",
	});
}
// refreshToken 생성
export function generateRefreshToken(expiresIn?: StringValue) {
	return jwt.sign({ type: "refresh" }, NEXT_PUBLIC_JWT_SECRET, {
		expiresIn: expiresIn || REFRESH_TOKEN_EXPIRES_IN,
		algorithm: "HS256",
	});
}
// 일반 page/api 상에서의 토큰 복호화
export function verifyToken(token: string): Token {
	return jwt.verify(token, NEXT_PUBLIC_JWT_SECRET, { algorithms: ["HS256"] }) as Token; // 실패 시 오류 발생
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
/* ---------------------------------------------------------------- */
// 휴대폰인증 토큰 생성
export function generatePhoneAuthToken(addPayload: { userId?: string } = {}) {
	const payload = { type: "phoneAuth", ...addPayload };
	return jwt.sign(payload, NEXT_PUBLIC_PHONE_AUTH, {
		expiresIn: PHONE_AUTH_EXPIRES_IN,
		algorithm: "HS256",
	});
}
// 휴대폰인증 토큰 복호화
export function verifyPhoneAuthToken(token: string): Token {
	return jwt.verify(token, NEXT_PUBLIC_PHONE_AUTH, { algorithms: ["HS256"] }) as Token; // 실패 시 오류 발생
}
// 비밀번호 변경토큰 생성
export function generatePwdResetToken(payload: { userId: string }) {
	return jwt.sign({ type: "pwdReset", userId: payload.userId }, NEXT_PUBLIC_PWD_CHANGE, {
		expiresIn: PWD_CHANGE_EXPIRES_IN,
		algorithm: "HS256",
	});
}
// 비밀번호 변경토큰 복호화
export function verifyPwdResetToken(token: string): Token {
	return jwt.verify(token, NEXT_PUBLIC_PWD_CHANGE, { algorithms: ["HS256"] }) as Token; // 실패 시 오류 발생
}
