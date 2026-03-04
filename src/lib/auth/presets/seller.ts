import API_URL from "@/api/endpoints";
import { CommonPreset, RefreshAuthPreset, WithAuthPreset } from "@/lib/auth/types";
import { generateRefreshToken, generateSellerToken, verifyRefreshToken, verifySellerToken } from "@/lib/auth/utils/token";
import { SELLER_TOKEN_COOKIE_AGE } from "@/lib/auth/utils/tokenTime";

const commonSellerPreset: CommonPreset<"SELLER"> = {
	role: "SELLER",
	primaryKey: "sellerNo",
	aToken: "sellerToken",
	rToken: "sellerRefreshToken",
	newAToken: "newSellerToken",
	newRToken: "newSellerRefreshToken",
};

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
