import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";
import { ACCESS_TOKEN_EXPIRES_IN, PHONE_AUTH_EXPIRES_IN, PWD_CHANGE_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "./tokenTime";
import type { StringValue } from "ms";
import {
	JWT_SECRET_KEY,
	MIDDLEWARE_JWT_SECRET_KEY,
	PHONE_AUTH_COMPLETE_KEY,
	PHONE_AUTH_KEY,
	PWD_CHANGE_KEY,
	REFRESH_JWT_SECRET_KEY,
} from "@/lib/env";
import { Token } from "@/types/token";

// accessToken 생성
export function generateAccessToken(payload: { userNo: number }, expiresIn?: StringValue) {
	return jwt.sign({ type: "ACCESS", userNo: payload.userNo }, JWT_SECRET_KEY, {
		expiresIn: expiresIn || ACCESS_TOKEN_EXPIRES_IN,
		algorithm: "HS256",
	});
}
// refreshToken 생성
export function generateRefreshToken(expiresIn?: StringValue) {
	return jwt.sign({ type: "REFRESH" }, REFRESH_JWT_SECRET_KEY, {
		expiresIn: expiresIn || REFRESH_TOKEN_EXPIRES_IN,
		algorithm: "HS256",
	});
}
// 일반 page/api 상에서의 a토큰 복호화
export function verifyToken(token: string): Token {
	const payload = jwt.verify(token, JWT_SECRET_KEY, { algorithms: ["HS256"] }) as Token; // 실패 시 오류 발생
	const isAccess = payload.userNo && payload.type === "ACCESS";
	if (!isAccess) throw new Error("INVALID_TOKEN_TYPE");
	return payload;
}

// 일반 page/api 상에서의 r토큰 복호화
export function verifyRefreshToken(token: string): Token {
	const payload = jwt.verify(token, REFRESH_JWT_SECRET_KEY, { algorithms: ["HS256"] }) as Token; // 실패 시 오류 발생
	const isRefresh = !payload.userNo && payload.type === "REFRESH";
	if (!isRefresh) throw new Error("INVALID_TOKEN_TYPE");
	return payload;
}

// middleware는 Edge Runtime에서 동작 => nodejs환경 jsonwebtoken이 작동안함.
// middleware 환경에서의 토큰 복호화
export async function middleware_verifyToken(token: string): Promise<Token> {
	try {
		const { payload } = await jwtVerify(token, MIDDLEWARE_JWT_SECRET_KEY, { algorithms: ["HS256"] });
		const isAccess = payload.userNo && payload.type === "ACCESS";
		const isRefresh = !payload.userNo && payload.type === "REFRESH";
		if (!isAccess && !isRefresh) throw new Error("INVALID_TOKEN_TYPE");
		return payload as Token;
	} catch (err) {
		console.error("Token verify failed", err);
		throw err;
	}
}
/* ----- 인증 관련 --------------------------------------------- */
// 휴대폰인증 토큰 생성
export function generatePhoneAuthToken(payload: { phone: string }) {
	return jwt.sign({ type: "PHONEAUTH", phone: payload.phone }, PHONE_AUTH_KEY, {
		expiresIn: PHONE_AUTH_EXPIRES_IN,
		algorithm: "HS256",
	});
}
// 휴대폰인증 토큰 복호화
export function verifyPhoneAuthToken(token: string): Token {
	const payload = jwt.verify(token, PHONE_AUTH_KEY, { algorithms: ["HS256"] }) as Token; // 실패 시 오류 발생
	if (payload.type !== "PHONEAUTH") throw new Error("INVALID_TOKEN_TYPE");
	return payload;
}
// 휴대폰인증성공 토큰 생성
export function generatePhoneAuthCompleteToken(addPayload: { userId?: string } = {}) {
	const payload = { type: "PHONEAUTHCOMPLETE", ...addPayload };
	return jwt.sign(payload, PHONE_AUTH_COMPLETE_KEY, {
		expiresIn: PHONE_AUTH_EXPIRES_IN,
		algorithm: "HS256",
	});
}
// 휴대폰인증성공 토큰 복호화
export function verifyPhoneAuthCompleteToken(token: string): Token {
	const payload = jwt.verify(token, PHONE_AUTH_COMPLETE_KEY, { algorithms: ["HS256"] }) as Token; // 실패 시 오류 발생
	if (payload.type !== "PHONEAUTHCOMPLETE") throw new Error("INVALID_TOKEN_TYPE");
	return payload;
}
// 비밀번호 변경토큰 생성
export function generatePwdResetToken(payload: { userId: string }) {
	return jwt.sign({ type: "PWDRESET", userId: payload.userId }, PWD_CHANGE_KEY, {
		expiresIn: PWD_CHANGE_EXPIRES_IN,
		algorithm: "HS256",
	});
}
// 비밀번호 변경토큰 복호화
export function verifyPwdResetToken(token: string): Token {
	const payload = jwt.verify(token, PWD_CHANGE_KEY, {
		algorithms: ["HS256"],
	}) as Token;
	if (payload.type !== "PWDRESET") throw new Error("INVALID_TOKEN_TYPE");
	return payload;
}
