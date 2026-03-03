import {
	ADMIN_JWT_SECRET_KEY,
	JWT_SECRET_KEY,
	MIDDLEWARE_ADMIN_JWT_SECRET_KEY,
	MIDDLEWARE_JWT_SECRET_KEY,
	MIDDLEWARE_REFRESH_JWT_SECRET_KEY,
	MIDDLEWARE_SELLER_JWT_SECRET_KEY,
	PHONE_AUTH_COMPLETE_KEY,
	PHONE_AUTH_KEY,
	PWD_CHANGE_KEY,
	REFRESH_JWT_SECRET_KEY,
	SELLER_JWT_SECRET_KEY,
} from "@/lib/env";
import {
	ACCESS_TOKEN_EXPIRES_IN,
	ADMIN_TOKEN_EXPIRES_IN,
	PHONE_AUTH_EXPIRES_IN,
	PWD_CHANGE_EXPIRES_IN,
	REFRESH_TOKEN_EXPIRES_IN,
	SELLER_TOKEN_EXPIRES_IN,
} from "@/lib/auth/utils/tokenTime";
import { generateToken, generateTokenForMiddleware, middlewareVerifyTokenByType, verifyTokenByType } from "@/lib/jwt";
import { StringValue } from "ms";
import { Token } from "@/types/token";

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
export async function verifyAccessTokenForMiddleware(token: string): Promise<Token> {
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

/* ===== SELLER ===== */

// sellerToken 생성
export function generateSellerToken(payload: { sellerNo: number }, expiresIn?: StringValue) {
	return generateToken(SELLER_JWT_SECRET_KEY, { type: "SELLER", sellerNo: payload.sellerNo }, expiresIn || SELLER_TOKEN_EXPIRES_IN);
}

// sellerToken 생성 (Middleware)
export async function generateSellerTokenForMiddleware(payload: { sellerNo: number }, expiresIn?: StringValue) {
	return generateTokenForMiddleware(
		MIDDLEWARE_SELLER_JWT_SECRET_KEY,
		{ type: "SELLER", sellerNo: payload.sellerNo },
		expiresIn || SELLER_TOKEN_EXPIRES_IN,
	);
}

// sellerToken 복호화 (Node.js)
export function verifySellerToken(token: string): Token {
	return verifyTokenByType(SELLER_JWT_SECRET_KEY, token, "SELLER", true);
}

// sellerToken 복호화 (Middleware)
export async function verifySellerTokenForMiddleware(token: string): Promise<Token> {
	return middlewareVerifyTokenByType(MIDDLEWARE_SELLER_JWT_SECRET_KEY, token, "SELLER", true);
}

/* ===== ADMIN ===== */

// adminToken 생성
export function generateAdminToken(payload: { adminNo: number }, expiresIn?: StringValue) {
	return generateToken(ADMIN_JWT_SECRET_KEY, { type: "ADMIN", adminNo: payload.adminNo }, expiresIn || ADMIN_TOKEN_EXPIRES_IN);
}

// adminToken 생성 (Middleware)
export async function generateAdminTokenForMiddleware(payload: { adminNo: number }, expiresIn?: StringValue) {
	return generateTokenForMiddleware(
		MIDDLEWARE_ADMIN_JWT_SECRET_KEY,
		{ type: "ADMIN", adminNo: payload.adminNo },
		expiresIn || ADMIN_TOKEN_EXPIRES_IN,
	);
}

// adminToken 복호화 (Node.js)
export function verifyAdminToken(token: string): Token {
	return verifyTokenByType(ADMIN_JWT_SECRET_KEY, token, "ADMIN", true);
}

// adminToken 복호화 (Middleware)
export async function verifyAdminTokenForMiddleware(token: string): Promise<Token> {
	return middlewareVerifyTokenByType(MIDDLEWARE_ADMIN_JWT_SECRET_KEY, token, "ADMIN", true);
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
