import { Token } from "@/types/token";
import { StringValue } from "ms";
import { NextRequest, NextResponse } from "next/server";

export type Role = "USER" | "SELLER" | "ADMIN";

export type RoleKeyMap = {
	USER: { primaryKey: "userNo"; aToken: "accessToken"; rToken: "refreshToken"; newAToken: "newAccessToken"; newRToken: "newRefreshToken" };
	SELLER: {
		primaryKey: "sellerNo";
		aToken: "sellerToken";
		rToken: "sellerRefreshToken";
		newAToken: "newSellerToken";
		newRToken: "newSellerRefreshToken";
	};
	ADMIN: {
		primaryKey: "adminNo";
		aToken: "adminToken";
		rToken: "adminRefreshToken";
		newAToken: "newAdminToken";
		newRToken: "newAdminRefreshToken";
	};
};

export type CommonPreset<R extends Role> = {
	role: R;
} & RoleKeyMap[R];

export type RefreshAuthPreset<R extends Role> = CommonPreset<R> & {
	verifyAToken: (token: string) => Token;
	verifyRToken: (token: string) => Token;
	generateAToken: (payload: { [key in RoleKeyMap[R]["primaryKey"]]: number }) => string;
	generateRToken: (expiresIn?: StringValue) => string;
	reTokenApiUrl: string;
};
export type WithAuthPreset<R extends Role> = CommonPreset<R> & {
	refreshAuthFromTokensPreset: RefreshAuthPreset<R>;
	aTokenCookieAge: number;
};

export type KeyOf<R extends Role, K extends keyof RoleKeyMap[R]> = RoleKeyMap[R][K];

type AuthContext<R extends Role, TParams extends Record<string, string>> = {
	nextRequest: NextRequest;
	params: TParams;
} & Record<KeyOf<R, "primaryKey">, number> &
	Record<KeyOf<R, "aToken">, string>;

export type AuthHandler<R extends Role, TParams extends Record<string, string> = Record<string, never>> = (
	ctx: AuthContext<R, TParams>,
) => Promise<NextResponse>;

// 토큰 재발급 결과
export type AutoRefreshResult<R extends Role> =
	| ({
			ok: true;
			isAnonymous?: boolean;
			reason?: "NO_TOKENS" | "NO_REFRESH";
	  } & Partial<Record<KeyOf<R, "primaryKey">, number>> &
			Partial<Record<KeyOf<R, "newAToken">, string>> &
			Partial<Record<KeyOf<R, "newRToken">, string>>)
	| { ok: false; status: number; message: string; clearCookies?: boolean };

// =========================================================
// MIDDLEWARE 용
// =========================================================

export type MiddlewareCommmonPreset = {
	verifyATokenForMiddleware: (token: string) => Promise<Token>;
	verifyRTokenForMiddleware: (token: string) => Promise<Token>;
};

export type MiddlewareTokenRefreshPreset<R extends Role> = CommonPreset<R> &
	MiddlewareCommmonPreset & {
		generateATokenForMiddleware: (payload: { [key in RoleKeyMap[R]["primaryKey"]]: number }) => Promise<string>;
		generateRTokenForMiddleware: (expiresIn?: StringValue) => Promise<string>;
		reTokenApiUrl: string;
		aTokenCookieAge: number;
	};

export type MiddlewareAuthCheckPreset<R extends Role> = CommonPreset<R> &
	MiddlewareCommmonPreset & {
		loginUrl: string;
	};
