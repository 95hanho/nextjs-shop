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
	generateAdminToken,
	generateAdminTokenForMiddleware,
	generateRefreshToken,
	generateRefreshTokenForMiddleware,
	verifyAdminToken,
	verifyAdminTokenForMiddleware,
	verifyRefreshToken,
	verifyRefreshTokenForMiddleware,
} from "@/lib/auth/utils/token";
import { ADMIN_TOKEN_COOKIE_AGE } from "@/lib/auth/utils/tokenTime";

const commonAdminPreset: CommonPreset<"ADMIN"> = {
	role: "ADMIN",
	primaryKey: "adminNo",
	aToken: "adminToken",
	rToken: "adminRefreshToken",
	newAToken: "newAdminToken",
	newRToken: "newAdminRefreshToken",
};

// =========================================================
// API 용
// =========================================================

export const adminRefreshAuthFromTokensPreset: RefreshAuthPreset<"ADMIN"> = {
	...commonAdminPreset,
	//
	verifyAToken: verifyAdminToken,
	verifyRToken: verifyRefreshToken,
	generateAToken: generateAdminToken,
	generateRToken: generateRefreshToken,
	reTokenApiUrl: API_URL.AUTH_TOKEN_REFRESH,
};

export const adminWithAuthPreset: WithAuthPreset<"ADMIN"> = {
	...commonAdminPreset,
	refreshAuthFromTokensPreset: adminRefreshAuthFromTokensPreset,
	aTokenCookieAge: ADMIN_TOKEN_COOKIE_AGE,
};
const commonAdminMiddlewarePreset: MiddlewareCommmonPreset = {
	verifyATokenForMiddleware: verifyAdminTokenForMiddleware,
	verifyRTokenForMiddleware: verifyRefreshTokenForMiddleware,
};

export const adminMiddlewareTokenRefreshPreset: MiddlewareTokenRefreshPreset<"ADMIN"> = {
	...commonAdminPreset,
	...commonAdminMiddlewarePreset,
	generateATokenForMiddleware: generateAdminTokenForMiddleware,
	generateRTokenForMiddleware: generateRefreshTokenForMiddleware,
	reTokenApiUrl: API_URL.ADMIN_TOKEN_REFRESH,
	aTokenCookieAge: ADMIN_TOKEN_COOKIE_AGE,
};

export const adminMiddlewareAuthCheckPreset: MiddlewareAuthCheckPreset<"ADMIN"> = {
	...commonAdminPreset,
	...commonAdminMiddlewarePreset,
	loginUrl: "/admin/login",
};
