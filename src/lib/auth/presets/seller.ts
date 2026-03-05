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
	generateRefreshToken,
	generateRefreshTokenForMiddleware,
	generateSellerToken,
	generateSellerTokenForMiddleware,
	verifyRefreshToken,
	verifyRefreshTokenForMiddleware,
	verifySellerToken,
	verifySellerTokenForMiddleware,
} from "@/lib/auth/utils/token";
import { SELLER_TOKEN_COOKIE_AGE } from "@/lib/auth/utils/tokenTime";

const commonSellerPreset: CommonPreset<"SELLER"> = {
	role: "SELLER",
	primaryKey: "sellerNo",
	aToken: "sellerToken",
	rToken: "sellerRefreshToken",
	newAToken: "newSellerToken",
	newRToken: "newSellerRefreshToken",
};

// =========================================================
// API 용
// =========================================================

export const sellerRefreshAuthFromTokensPreset: RefreshAuthPreset<"SELLER"> = {
	...commonSellerPreset,
	//
	verifyAToken: verifySellerToken,
	verifyRToken: verifyRefreshToken,
	generateAToken: generateSellerToken,
	generateRToken: generateRefreshToken,
	reTokenApiUrl: API_URL.AUTH_TOKEN_REFRESH,
};

export const sellerWithAuthPreset: WithAuthPreset<"SELLER"> = {
	...commonSellerPreset,
	refreshAuthFromTokensPreset: sellerRefreshAuthFromTokensPreset,
	aTokenCookieAge: SELLER_TOKEN_COOKIE_AGE,
};
// =========================================================
// MIDDLEWARE 용
// =========================================================

const commonSellerMiddlewarePreset: MiddlewareCommmonPreset = {
	verifyATokenForMiddleware: verifySellerTokenForMiddleware,
	verifyRTokenForMiddleware: verifyRefreshTokenForMiddleware,
};

export const sellerMiddlewareTokenRefreshPreset: MiddlewareTokenRefreshPreset<"SELLER"> = {
	...commonSellerPreset,
	...commonSellerMiddlewarePreset,
	generateATokenForMiddleware: generateSellerTokenForMiddleware,
	generateRTokenForMiddleware: generateRefreshTokenForMiddleware,
	reTokenApiUrl: API_URL.SELLER_TOKEN_REFRESH,
	aTokenCookieAge: SELLER_TOKEN_COOKIE_AGE,
};

export const sellerMiddlewareAuthCheckPreset: MiddlewareAuthCheckPreset<"SELLER"> = {
	...commonSellerPreset,
	...commonSellerMiddlewarePreset,
	loginUrl: "/seller/login",
};
