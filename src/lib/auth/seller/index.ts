import { withAuth } from "@/lib/auth/api";
import { handleAuthCheck, handleTokenRefresh } from "@/lib/auth/mv";
import { sellerMiddlewareAuthCheckPreset, sellerMiddlewareTokenRefreshPreset, sellerWithAuthPreset } from "@/lib/auth/presets/seller";
import { AuthHandler } from "@/lib/auth/types";
import { NextRequest, NextResponse } from "next/server";

// 판매자 페이지 인증 필요 API 핸들러
export const sellerWithAuth = <TParams extends Record<string, string> = Record<string, never>>(handler: AuthHandler<"SELLER", TParams>) => {
	return withAuth(handler, sellerWithAuthPreset);
};

// ===========================================================================
// MIDDLEWARE에서 토큰 재발급 처리
// ===========================================================================

export const sellerHandleTokenRefresh = (nextRequest: NextRequest) => {
	return handleTokenRefresh(nextRequest, sellerMiddlewareTokenRefreshPreset);
};

export const sellerHandleAuthCheck = (nextRequest: NextRequest, baseResponse: NextResponse) => {
	return handleAuthCheck(nextRequest, baseResponse, sellerMiddlewareAuthCheckPreset);
};
