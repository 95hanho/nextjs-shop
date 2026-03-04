import API_URL from "@/api/endpoints";
import {
	CommonPreset,
	MiddlewareAuthCheckPreset,
	MiddlewareCommmonPreset,
	MiddlewareTokenRefreshPreset,
	RefreshAuthPreset,
	WithAuthPreset,
} from "@/lib/auth/types";
import {
	generateAccessToken,
	generateAccessTokenForMiddleware,
	generateRefreshToken,
	generateRefreshTokenForMiddleware,
	verifyAccessToken,
	verifyAccessTokenForMiddleware,
	verifyRefreshToken,
	verifyRefreshTokenForMiddleware,
} from "@/lib/auth/utils/token";
import { ACCESS_TOKEN_COOKIE_AGE } from "@/lib/auth/utils/tokenTime";

const commonUserPreset: CommonPreset<"USER"> = {
	role: "USER",
	primaryKey: "userNo",
	aToken: "accessToken",
	rToken: "refreshToken",
	newAToken: "newAccessToken",
	newRToken: "newRefreshToken",
};

// =========================================================
// API 용
// =========================================================

export const userRefreshAuthFromTokensPreset: RefreshAuthPreset<"USER"> = {
	...commonUserPreset,
	//
	verifyAToken: verifyAccessToken,
	verifyRToken: verifyRefreshToken,
	generateAToken: generateAccessToken,
	generateRToken: generateRefreshToken,
	reTokenApiUrl: API_URL.AUTH_TOKEN_REFRESH,
};

export const userWithAuthPreset: WithAuthPreset<"USER"> = {
	...commonUserPreset,
	refreshAuthFromTokensPreset: userRefreshAuthFromTokensPreset,
	aTokenCookieAge: ACCESS_TOKEN_COOKIE_AGE,
};

// =========================================================
// MIDDLEWARE 용
// =========================================================

const commonUserMiddlewarePreset: MiddlewareCommmonPreset = {
	verifyATokenForMiddleware: verifyAccessTokenForMiddleware,
	verifyRTokenForMiddleware: verifyRefreshTokenForMiddleware,
};

export const userMiddlewareTokenRefreshPreset: MiddlewareTokenRefreshPreset<"USER"> = {
	...commonUserPreset,
	...commonUserMiddlewarePreset,
	generateATokenForMiddleware: generateAccessTokenForMiddleware,
	generateRTokenForMiddleware: generateRefreshTokenForMiddleware,
	reTokenApiUrl: API_URL.AUTH_TOKEN_REFRESH,
	aTokenCookieAge: ACCESS_TOKEN_COOKIE_AGE,
};

export const userMiddlewareAuthCheckPreset: MiddlewareAuthCheckPreset<"USER"> = {
	...commonUserPreset,
	...commonUserMiddlewarePreset,
	loginUrl: "/user",
};
