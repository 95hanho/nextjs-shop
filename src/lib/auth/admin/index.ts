import { withAuth } from "@/lib/auth/api";
import { handleAuthCheck, handleTokenRefresh } from "@/lib/auth/mv";
import { adminMiddlewareAuthCheckPreset, adminMiddlewareTokenRefreshPreset, adminWithAuthPreset } from "@/lib/auth/presets/admin";
import { AuthHandler } from "@/lib/auth/types";
import { NextRequest, NextResponse } from "next/server";

// 관리자 페이지 인증 필요 API 핸들러
export const adminWithAuth = <TParams extends Record<string, string> = Record<string, never>>(handler: AuthHandler<"ADMIN", TParams>) => {
	return withAuth(handler, adminWithAuthPreset);
};

// ===========================================================================
// MIDDLEWARE에서 토큰 재발급 처리
// ===========================================================================

export const adminHandleTokenRefresh = (nextRequest: NextRequest) => {
	return handleTokenRefresh(nextRequest, adminMiddlewareTokenRefreshPreset);
};

export const adminHandleAuthCheck = (nextRequest: NextRequest, baseResponse: NextResponse) => {
	return handleAuthCheck(nextRequest, baseResponse, adminMiddlewareAuthCheckPreset);
};
