import { refreshAuthFromTokens, withAuth } from "@/lib/auth/api";
import { handleAuthCheck, handleTokenRefresh } from "@/lib/auth/mv";
import {
	userMiddlewareAuthCheckPreset,
	userMiddlewareTokenRefreshPreset,
	userRefreshAuthFromTokensPreset,
	userWithAuthPreset,
} from "@/lib/auth/presets/user";
import { AuthHandler } from "@/lib/auth/types";
import { ACCESS_TOKEN_COOKIE_AGE, REFRESH_TOKEN_COOKIE_AGE } from "@/lib/auth/utils/tokenTime";
import { isProd } from "@/lib/env";
import { NextRequest, NextResponse } from "next/server";

// 유저 페이지 인증 필요 API 핸들러
export const userWithAuth = <TParams extends Record<string, string> = Record<string, never>>(handler: AuthHandler<"USER", TParams>) => {
	return withAuth(handler, userWithAuthPreset);
};

// ===========================================================================
// user에서만 필요
// 인증이 필요할 수도 있고 아닐 수도 있는 API 핸들러
// userNo가 없어도 통과(예: 로그인 상태면 userNo도 주고, 아니면 null 주는 식)
// ===========================================================================
type OptionalAuthHandler<TParams extends Record<string, string> = Record<string, never>> = (ctx: {
	nextRequest: NextRequest;
	userNo: number | null;
	accessToken: string | null;
	params: TParams;
}) => Promise<NextResponse>;
//
type AuthMode = "optional" | "required";
const getAuthMode = (nextRequest: NextRequest): AuthMode => {
	// api요청시 header에 "x-auth-mode": "required", // or "optional" 이렇게 FE에서 던지면됨.
	// console.log('[API withOptionalAuth:USER] 마지막 토큰확인 nextRequest.headers.get("x-auth-mode")', nextRequest.headers.get("x-auth-mode"));
	const v = (nextRequest.headers.get("x-auth-mode") || "").toLowerCase();
	return v === "required" ? "required" : "optional";
};
//
export const withOptionalAuth =
	<TParams extends Record<string, string> = Record<string, never>>(handler: OptionalAuthHandler<TParams>) =>
	async (nextRequest: NextRequest, context: { params: TParams }): Promise<NextResponse> => {
		const authMode = getAuthMode(nextRequest);
		const auth = await refreshAuthFromTokens(nextRequest, userRefreshAuthFromTokensPreset);

		// console.log("[API withOptionalAuth:USER] auth", auth);
		if (authMode === "required" && auth.ok && !auth.userNo) {
			// 이건 테스트 해봐야곘는데~~
			const response = NextResponse.json({ message: "SESSION_EXPIRED" }, { status: 401 });

			// FE가 “아 이건 로그아웃해야겠다” 판단하기 쉽게 신호도 추가
			// response.headers.set("x-session-expired", "1");
			return response;
		}

		if (!auth.ok) {
			// ✅ refresh 불량/만료 + FE가 required 의도면 => 로그아웃 유도(끊기)
			const response = await handler({
				nextRequest,
				userNo: null,
				accessToken: null,
				params: context.params,
			});

			if (auth.clearCookies) {
				response.cookies.set("accessToken", "", {
					httpOnly: true,
					secure: isProd,
					sameSite: "strict",
					path: "/",
					maxAge: 0,
				});
				response.cookies.set("refreshToken", "", {
					httpOnly: true,
					secure: isProd,
					sameSite: "strict",
					path: "/",
					maxAge: 0,
				});
				console.warn("[API withOptionalAuth:USER] 토큰지워!!!!");
			}

			return response;
		}

		// ✅ “이번 요청에서 Spring에 보낼 accessToken” 결정
		const accessToken = auth.newAccessToken ?? nextRequest.cookies.get("accessToken")?.value ?? null;
		const userNo = auth.userNo ?? null;

		// if (!accessToken || !auth.userNo) {
		// 	return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
		// }

		/* API 실행 전 --------------------------------> */

		const response = await handler({
			nextRequest,
			userNo,
			accessToken,
			params: context.params,
		});

		/* API 실행 후 --------------------------------> */

		// 토큰 재발급된 경우 쿠키 세팅
		if (auth.newAccessToken && auth.newRefreshToken) {
			response.cookies.set("accessToken", auth.newAccessToken, {
				httpOnly: true,
				secure: isProd,
				sameSite: "strict",
				path: "/",
				maxAge: ACCESS_TOKEN_COOKIE_AGE,
			});
			response.cookies.set("refreshToken", auth.newRefreshToken, {
				httpOnly: true,
				secure: isProd,
				sameSite: "strict",
				path: "/",
				maxAge: REFRESH_TOKEN_COOKIE_AGE,
			});
			console.log("[API withOptionalAuth:USER] 토큰 다시 세팅 !!!! ---------------------", nextRequest.url);
		}
		console.log(`[API withOptionalAuth:USER] 마지막 토큰확인`, {
			accessToken: "..." + nextRequest.cookies.get("accessToken")?.value?.slice(-10),
			refreshToken: "..." + nextRequest.cookies.get("refreshToken")?.value?.slice(-10),
		});

		return response;
	};

// ===========================================================================
// MIDDLEWARE에서 토큰 재발급 처리
// ===========================================================================

export const userHandleTokenRefresh = (nextRequest: NextRequest) => {
	return handleTokenRefresh(nextRequest, userMiddlewareTokenRefreshPreset);
};

export const userHandleAuthCheck = (nextRequest: NextRequest, baseResponse: NextResponse) => {
	return handleAuthCheck(nextRequest, baseResponse, userMiddlewareAuthCheckPreset);
};
