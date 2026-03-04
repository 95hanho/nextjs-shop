import API_URL from "@/api/endpoints";
import { CommonPreset, RefreshAuthPreset, WithAuthPreset } from "@/lib/auth/types";
import { generateAdminToken, generateRefreshToken, verifyAdminToken, verifyRefreshToken } from "@/lib/auth/utils/token";
import { ADMIN_TOKEN_COOKIE_AGE } from "@/lib/auth/utils/tokenTime";

const commonAdminPreset: CommonPreset<"ADMIN"> = {
	role: "ADMIN",
	primaryKey: "adminNo",
	aToken: "adminToken",
	rToken: "adminRefreshToken",
	newAToken: "newAdminToken",
	newRToken: "newAdminRefreshToken",
};

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
