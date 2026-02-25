import jwt from "jsonwebtoken";
import { jwtVerify, SignJWT } from "jose";
import { ACCESS_TOKEN_EXPIRES_IN, PHONE_AUTH_EXPIRES_IN, PWD_CHANGE_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "./tokenTime";
import { TextEncoder } from "util";
import ms from "ms";
import type { StringValue } from "ms";
import {
	JWT_SECRET_KEY,
	MIDDLEWARE_JWT_SECRET_KEY,
	MIDDLEWARE_REFRESH_JWT_SECRET_KEY,
	PHONE_AUTH_COMPLETE_KEY,
	PHONE_AUTH_KEY,
	PWD_CHANGE_KEY,
	REFRESH_JWT_SECRET_KEY,
} from "@/lib/env";
import { Token } from "@/types/token";

/* ===== 제네릭 헬퍼 함수 ===== */

/** JWT 생성 (Node.js 환경) */
function generateToken(secret: string, payload: object, expiresIn: StringValue) {
	return jwt.sign(payload, secret, { expiresIn, algorithm: "HS256" });
}

//* JWT 생성 (Middleware Edge Runtime) */
async function generateTokenForMiddleware(secret: string | Uint8Array, payload: object, expiresIn: StringValue) {
	const secretAsUint8Array = typeof secret === "string" ? new TextEncoder().encode(secret) : secret;
	const expiresInMs = typeof expiresIn === "string" ? ms(expiresIn) : expiresIn;
	const expiresAt = Math.floor(Date.now() / 1000) + Math.floor(expiresInMs / 1000);

	return new SignJWT(payload as Record<string, unknown>).setProtectedHeader({ alg: "HS256" }).setExpirationTime(expiresAt).sign(secretAsUint8Array);
}

/** JWT 검증 (Node.js 환경) */
function verifyTokenByType(secret: string, token: string, expectedType: string, hasUserNo = false): Token {
	const payload = jwt.verify(token, secret, { algorithms: ["HS256"] }) as Token;

	// 타입과 userNo 조건 검증
	const isValid = payload.type === expectedType && (!hasUserNo ? !payload.userNo : !!payload.userNo);
	if (!isValid) throw new Error("INVALID_TOKEN_TYPE");

	return payload;
}

/** JWT 검증 (Middleware Edge Runtime) */
async function middlewareVerifyTokenByType(secret: string | Uint8Array, token: string, expectedType: string, hasUserNo = false): Promise<Token> {
	try {
		const secretAsUint8Array = typeof secret === "string" ? new TextEncoder().encode(secret) : secret;
		const { payload } = await jwtVerify(token, secretAsUint8Array, { algorithms: ["HS256"] });

		const isValid = payload.type === expectedType && (!hasUserNo ? !payload.userNo : !!payload.userNo);
		if (!isValid) throw new Error("INVALID_TOKEN_TYPE");

		return payload as Token;
	} catch (err) {
		console.error("Token verify failed", err);
		throw err;
	}
}

/* ===== Access & Refresh Token ===== */

// accessToken 생성
export function generateAccessToken(payload: { userNo: number }, expiresIn?: StringValue) {
	return generateToken(JWT_SECRET_KEY, { type: "ACCESS", userNo: payload.userNo }, expiresIn || ACCESS_TOKEN_EXPIRES_IN);
}

// accessToken 생성 (Middleware)
export async function generateAccessTokenForMiddleware(payload: { userNo: number }, expiresIn?: StringValue) {
	return generateTokenForMiddleware(MIDDLEWARE_JWT_SECRET_KEY, { type: "ACCESS", userNo: payload.userNo }, expiresIn || ACCESS_TOKEN_EXPIRES_IN);
}

// refreshToken 생성
export function generateRefreshToken(expiresIn?: StringValue) {
	return generateToken(REFRESH_JWT_SECRET_KEY, { type: "REFRESH" }, expiresIn || REFRESH_TOKEN_EXPIRES_IN);
}

// refreshToken 생성 (Middleware)
export async function generateRefreshTokenForMiddleware(expiresIn?: StringValue) {
	return generateTokenForMiddleware(MIDDLEWARE_REFRESH_JWT_SECRET_KEY, { type: "REFRESH" }, expiresIn || REFRESH_TOKEN_EXPIRES_IN);
}

// accessToken 복호화 (Node.js)
export function verifyAccessToken(token: string): Token {
	return verifyTokenByType(JWT_SECRET_KEY, token, "ACCESS", true);
}

// accessToken 복호화 (Middleware)
export async function verifyAccessTokeForMiddleware(token: string): Promise<Token> {
	return middlewareVerifyTokenByType(MIDDLEWARE_JWT_SECRET_KEY, token, "ACCESS", true);
}

// refreshToken 복호화 (Node.js)
export function verifyRefreshToken(token: string): Token {
	return verifyTokenByType(REFRESH_JWT_SECRET_KEY, token, "REFRESH", false);
}

// refreshToken 복호화 (Middleware)
export async function verifyRefreshTokenForMiddleware(token: string): Promise<Token> {
	return middlewareVerifyTokenByType(MIDDLEWARE_REFRESH_JWT_SECRET_KEY, token, "REFRESH", false);
}

/* ===== 휴대폰 인증 Token ===== */

// 휴대폰인증 토큰 생성
export function generatePhoneAuthToken() {
	return generateToken(PHONE_AUTH_KEY, { type: "PHONEAUTH" }, PHONE_AUTH_EXPIRES_IN);
}

// 휴대폰인증 토큰 복호화
export function verifyPhoneAuthToken(token: string): Token {
	return verifyTokenByType(PHONE_AUTH_KEY, token, "PHONEAUTH", false);
}

// 휴대폰인증성공 토큰 생성
export function generatePhoneAuthCompleteToken(addPayload: { userId?: string } = {}) {
	return generateToken(PHONE_AUTH_COMPLETE_KEY, { type: "PHONEAUTHCOMPLETE", ...addPayload }, PHONE_AUTH_EXPIRES_IN);
}

// 휴대폰인증성공 토큰 복호화
export function verifyPhoneAuthCompleteToken(token: string): Token {
	return verifyTokenByType(PHONE_AUTH_COMPLETE_KEY, token, "PHONEAUTHCOMPLETE", false);
}

/* ===== 비밀번호 변경 Token ===== */

// 비밀번호 변경토큰 생성
export function generatePwdResetToken(payload: { userNo: number }) {
	return generateToken(PWD_CHANGE_KEY, { type: "PWDRESET", userId: payload.userNo }, PWD_CHANGE_EXPIRES_IN);
}

// 비밀번호 변경토큰 복호화
export function verifyPwdResetToken(token: string): Token {
	return verifyTokenByType(PWD_CHANGE_KEY, token, "PWDRESET", false);
}
