import { postUrlFormData } from "@/api/fetchFilter";
import { NextRequest, NextResponse } from "next/server";
import { BaseResponse } from "@/types/common";
import { isProd } from "@/lib/env";
import { REFRESH_TOKEN_COOKIE_AGE } from "@/lib/auth/utils/tokenTime";
import { Token } from "@/types/token";
import { AutoRefreshResult, AuthHandler, KeyOf, RefreshAuthPreset, Role, WithAuthPreset } from "@/lib/auth/types";
import { tokenRefreshLock } from "@/lib/auth/utils/lock";
import { getBackendUrl } from "@/lib/getBaseUrl";

/**
 *  토큰 재발급
 *  API동작 시 refreshToken은 있는데 accessToken가 없을 때 재발급 해주기 위해서 사용
 */
export const refreshAuthFromTokens = async <R extends Role>(
	nextRequest: NextRequest,
	preset: RefreshAuthPreset<R>,
): Promise<AutoRefreshResult<R>> => {
	const accessToken = nextRequest.cookies.get(preset.aToken)?.value || nextRequest.headers.get(preset.aToken) || undefined;
	const refreshToken = nextRequest.cookies.get(preset.rToken)?.value || nextRequest.headers.get(preset.rToken) || undefined;

	console.log(`[API refreshAuthFromTokens:${preset.role}] 토큰 재발급 / 현재 토큰 =>`, {
		[preset.aToken]: accessToken ? accessToken.slice(-10) + "..." : "없음",
		[preset.rToken]: refreshToken ? refreshToken.slice(-10) + "..." : "없음",
	});

	// 1) accessToken 유효하면 그대로 통과
	if (accessToken?.trim()) {
		try {
			const token: Token = preset.verifyAToken(accessToken);
			return { ok: true, [preset.primaryKey]: token[preset.primaryKey] };
		} catch {
			// accessToken 만료 → 아래에서 refreshToken으로 처리
			console.warn(`[API refreshAuthFromTokens:${preset.role}] accessToken 만료됨!!!`);
		}
	}

	// 2) refreshToken도 없으면 완전 로그아웃 상태
	if (!refreshToken?.trim()) {
		return {
			ok: true,
			isAnonymous: true,
			reason: "NO_REFRESH",
		};
	}

	// 3) refreshToken 검증
	try {
		preset.verifyRToken(refreshToken);
	} catch {
		return {
			ok: false,
			status: 401,
			message: "REFRESH_UNAUTHORIZED",
			clearCookies: true,
		};
	}

	// 4) ✅ Lock을 사용하여 중복 갱신 방지
	const lockKey = `refresh:${preset.role}:${refreshToken.slice(-10)}`; // refreshToken 뒷부분으로 key 생성

	return tokenRefreshLock.acquireOrWait(lockKey, async () => {
		console.log(`[API TokenRefresh:${preset.role}] 토큰 갱신 시작: ${lockKey}`);

		const newRefreshToken = preset.generateRToken();
		const xffHeader = nextRequest.headers.get("x-forwarded-for");
		const ip = xffHeader?.split(",")[0]?.trim() ?? nextRequest.headers.get("x-real-ip") ?? "unknown";

		const reTokenData = await postUrlFormData<BaseResponse & { [key in typeof preset.primaryKey]: number }>(
			getBackendUrl(preset.reTokenApiUrl),
			{
				beforeToken: refreshToken,
				[preset.rToken]: newRefreshToken,
			},
			{
				userAgent: nextRequest.headers.get("user-agent") || "",
				["x-forwarded-for"]: ip,
			},
		);
		// console.log(`[API TokenRefresh:${preset.role}] 토큰 재생성 완료 ${reTokenData}`);

		const primaryKey = preset.primaryKey as KeyOf<R, "primaryKey">;
		const aTokenPayload = {
			[primaryKey]: reTokenData[primaryKey],
		} as Record<KeyOf<R, "primaryKey">, number>;

		const newAccessToken = preset.generateAToken(aTokenPayload);

		console.log(`[API TokenRefresh:${preset.role}]`, {
			[preset.newAToken]: newAccessToken.slice(-10) + "...",
			[preset.newRToken]: newRefreshToken.slice(-10) + "...",
		});

		return {
			ok: true,
			[preset.primaryKey]: reTokenData[preset.primaryKey],
			[preset.newAToken]: newAccessToken,
			[preset.newRToken]: newRefreshToken,
		};
	});
};

// ===========================================================================
// 인증 필요한 API 핸들러
// ===========================================================================
export const withAuth =
	<R extends Role, TParams extends Record<string, string> = Record<string, never>>(handler: AuthHandler<R, TParams>, preset: WithAuthPreset<R>) =>
	async (nextRequest: NextRequest, context: { params: TParams }): Promise<NextResponse> => {
		const auth = await refreshAuthFromTokens(nextRequest, preset.refreshAuthFromTokensPreset);

		if (!auth.ok) {
			const response = NextResponse.json({ message: auth.message }, { status: auth.status });

			if (auth.clearCookies) {
				response.cookies.set(preset.aToken, "", {
					httpOnly: true,
					secure: isProd,
					sameSite: "strict",
					path: "/",
					maxAge: 0,
				});
				response.cookies.set(preset.rToken, "", {
					httpOnly: true,
					secure: isProd,
					sameSite: "strict",
					path: "/",
					maxAge: 0,
				});
				console.warn(`[API withAuth:${preset.role}] 토큰초기화!!`);
			}

			return response;
		}

		type OkAuth = Extract<AutoRefreshResult<R>, { ok: true }>;
		const okAuth = auth as OkAuth;

		const primaryKey = preset.primaryKey as KeyOf<R, "primaryKey">;
		const aTokenKey = preset.aToken as KeyOf<R, "aToken">;
		const newATokenKey = preset.newAToken as KeyOf<R, "newAToken">;
		const newRTokenKey = preset.newRToken as KeyOf<R, "newRToken">;

		// ✅ “이번 요청에서 Spring에 보낼 accessToken” 결정
		const accessToken = okAuth[newATokenKey] ?? nextRequest.cookies.get(preset.aToken)?.value;

		if (!accessToken || !okAuth[primaryKey]) {
			return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
		}

		/* API 실행 전 --------------------------------> */

		const response = await handler({
			nextRequest,
			[primaryKey]: okAuth[primaryKey],
			[aTokenKey]: accessToken,
			params: context.params,
		} as Parameters<AuthHandler<R, TParams>>[0]);

		/* API 실행 후 --------------------------------> */

		// 토큰 재발급된 경우 쿠키 세팅
		if (okAuth[newATokenKey] && okAuth[newRTokenKey]) {
			response.cookies.set(preset.aToken, okAuth[newATokenKey] as string, {
				httpOnly: true,
				secure: isProd,
				sameSite: "strict",
				path: "/",
				maxAge: preset.aTokenCookieAge,
			});
			response.cookies.set(preset.rToken, okAuth[newRTokenKey] as string, {
				httpOnly: true,
				secure: isProd,
				sameSite: "strict",
				path: "/",
				maxAge: REFRESH_TOKEN_COOKIE_AGE,
			});
			console.log(`[API withAuth:${preset.role}] 토큰 쿠키 재설정 완료`, {
				newAccessToken: (okAuth[newATokenKey] as string).slice(-10) + "...",
				newRefreshToken: (okAuth[newRTokenKey] as string).slice(-10) + "...",
			});
		}
		return response;
	};
