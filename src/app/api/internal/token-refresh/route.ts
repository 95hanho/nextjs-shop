import { refreshAuthFromTokens } from "@/lib/auth/api";
import { adminRefreshAuthFromTokensPreset, adminWithAuthPreset } from "@/lib/auth/presets/admin";
import { sellerRefreshAuthFromTokensPreset, sellerWithAuthPreset } from "@/lib/auth/presets/seller";
import { userRefreshAuthFromTokensPreset, userWithAuthPreset } from "@/lib/auth/presets/user";
import { AutoRefreshResult, RefreshAuthPreset, Role, WithAuthPreset } from "@/lib/auth/types";
import { REFRESH_TOKEN_COOKIE_AGE } from "@/lib/auth/utils/tokenTime";
import { INTERNAL_REFRESH_SECRET } from "@/lib/env.server";
import { isProd } from "@/lib/env.common";
import { NextRequest, NextResponse } from "next/server";

const refreshPresets: Record<Role, RefreshAuthPreset<Role>> = {
	USER: userRefreshAuthFromTokensPreset,
	SELLER: sellerRefreshAuthFromTokensPreset,
	ADMIN: adminRefreshAuthFromTokensPreset,
};

const withAuthPresets: Record<Role, WithAuthPreset<Role>> = {
	USER: userWithAuthPreset,
	SELLER: sellerWithAuthPreset,
	ADMIN: adminWithAuthPreset,
};

const isRole = (value: string | null): value is Role => value === "USER" || value === "SELLER" || value === "ADMIN";

export async function POST(nextRequest: NextRequest) {
	console.log("[API] 토큰 재발급 내부 API 호출");
	if (!INTERNAL_REFRESH_SECRET || nextRequest.headers.get("x-internal-refresh-secret") !== INTERNAL_REFRESH_SECRET) {
		return NextResponse.json({ message: "FORBIDDEN" }, { status: 403 });
	}

	const role = nextRequest.headers.get("x-auth-role");
	console.log("[API] 토큰 재발급 내부 API 호출 성공 - 권한 있음", role);
	if (!isRole(role)) {
		return NextResponse.json({ message: "BAD_REQUEST" }, { status: 400 });
	}

	const refreshPreset = refreshPresets[role];
	const withAuthPreset = withAuthPresets[role];
	const auth = await refreshAuthFromTokens(nextRequest, refreshPreset);

	if (!auth.ok) {
		return NextResponse.json({ message: auth.message }, { status: auth.status });
	}

	const okAuth = auth as Extract<AutoRefreshResult<Role>, { ok: true }>;
	const newATokenKey = withAuthPreset.newAToken;
	const newRTokenKey = withAuthPreset.newRToken;
	const newAccessToken = okAuth[newATokenKey];
	const newRefreshToken = okAuth[newRTokenKey];

	if (!newAccessToken || !newRefreshToken) {
		return NextResponse.json({ refreshed: false }, { status: 200 });
	}

	const response = NextResponse.json({ refreshed: true }, { status: 200 });
	response.cookies.set(withAuthPreset.aToken, newAccessToken, {
		httpOnly: true,
		secure: isProd,
		sameSite: "strict",
		path: "/",
		maxAge: withAuthPreset.aTokenCookieAge,
	});
	response.cookies.set(withAuthPreset.rToken, newRefreshToken, {
		httpOnly: true,
		secure: isProd,
		sameSite: "strict",
		path: "/",
		maxAge: REFRESH_TOKEN_COOKIE_AGE,
	});

	return response;
}
