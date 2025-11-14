import { getNormal, putUrlFormData } from "@/api/fetchFilter";
import { cookies } from "next/headers";
import { getBaseUrl, getServerUrl } from "./getBaseUrl";
import API_URL from "@/api/endpoints";
import { Token, UserResponse } from "@/types/auth";
import { NextRequest, NextResponse } from "next/server";
import { generateAccessToken, generateRefreshToken, verifyToken } from "./jwt";
import { BaseResponse } from "@/types/common";
import { isProd } from "./env";
import { ACCESS_TOKEN_COOKIE_AGE, REFRESH_TOKEN_COOKIE_AGE } from "./tokenTime";

/** 처음페이지로드 시 accessToken있으면 유저 정보 가져옴 */
export async function getServerSession() {
	const accessToken = (await cookies()).get("accessToken")?.value;
	const refreshToken = (await cookies()).get("refreshToken")?.value;
	console.log("rootLayout accessToken", accessToken?.substring(0, 10));
	if (!accessToken) return null;

	const data = await getNormal<UserResponse>(getBaseUrl(API_URL.AUTH), undefined, {
		Cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}`,
	});

	return data.user;
}
/**
 * 로그아웃쿼리 추가
 * @param originUrl 원래url
 * @returns 추가 url
 */
export const addLogoutQuery = (originUrl: string): string => {
	const url = new URL(originUrl); // originURL이 'https://...'값이므로 뒤에 baseURL을 안넣어도됨.
	url.searchParams.set("logout", "1");
	return url.pathname + (url.search ? url.search : "");
};
type AutoRefreshResult =
	| {
			ok: true;
			userId?: string;
			newAccessToken?: string;
			newRefreshToken?: string;
	  }
	| {
			ok: false;
			status: number;
			message: string;
			clearCookies?: boolean;
	  };

// API동작 시 refreshToken은 있는데 accessToken가 없을 때 재발급 해주기 위해서 사용
const authFromTokens = async (nextRequest: NextRequest): Promise<AutoRefreshResult> => {
	const accessToken = nextRequest.cookies.get("accessToken")?.value || nextRequest.headers.get("accessToken") || undefined;
	const refreshToken = nextRequest.cookies.get("refreshToken")?.value || nextRequest.headers.get("refreshToken") || undefined;
	console.log("authFromTokens -----------", accessToken?.substring(0, 3), refreshToken?.substring(0, 3));

	// 1) accessToken 유효하면 그대로 통과
	if (accessToken) {
		try {
			const token: Token = verifyToken(accessToken);
			return { ok: true, userId: token.userId };
		} catch {
			// accessToken 만료 → 아래에서 refreshToken으로 처리
			console.warn("만료됨!!!");
		}
	}

	// 2) refreshToken도 없으면 완전 로그아웃 상태
	if (!refreshToken) {
		return {
			ok: true,
		};
	}

	// 3) refreshToken 검증
	try {
		verifyToken(refreshToken);
	} catch {
		return {
			ok: false,
			status: 401,
			message: "REFRESH_UNAUTHORIZED",
			clearCookies: true,
		};
	}
	// 4) refreshToken 유효 → 백엔드에 토큰 갱신 요청
	const newRefreshToken = generateRefreshToken();
	const xffHeader = nextRequest.headers.get("x-forwarded-for");
	const ip =
		xffHeader?.split(",")[0]?.trim() ??
		// 일부 환경에서는 Cloudflare나 Reverse Proxy 헤더 사용
		nextRequest.headers.get("x-real-ip") ??
		"unknown";

	const reTokenData = await putUrlFormData<BaseResponse & { userId: string }>(
		getServerUrl(API_URL.AUTH_TOKEN),
		{
			beforeToken: refreshToken,
			refreshToken: newRefreshToken,
		},
		{
			userAgent: nextRequest.headers.get("user-agent") || "",
			["x-forwarded-for"]: ip,
		}
	);
	console.log("reTokenData", reTokenData);

	const newAccessToken = generateAccessToken({ userId: reTokenData.userId });
	console.log("newAccessToken", newRefreshToken.substring(0, 10), "newRefreshToken", newRefreshToken.substring(0, 10));

	return {
		ok: true,
		userId: reTokenData.userId,
		newAccessToken,
		newRefreshToken,
	};
};
type HandlerWithAuth = (ctx: { nextRequest: NextRequest; userId?: string }) => Promise<NextResponse> | NextResponse;

export const withAuth =
	(handler: HandlerWithAuth) =>
	async (nextRequest: NextRequest): Promise<NextResponse> => {
		const auth = await authFromTokens(nextRequest);

		if (!auth.ok) {
			const response = NextResponse.json({ message: auth.message }, { status: auth.status });

			if (auth.clearCookies) {
				console.warn("토큰지워!!!!");
				response.cookies.set("accessToken", "", {
					httpOnly: true,
					secure: true,
					sameSite: "strict",
					path: "/",
					maxAge: 0,
				});
				response.cookies.set("refreshToken", "", {
					httpOnly: true,
					secure: true,
					sameSite: "strict",
					path: "/",
					maxAge: 0,
				});
			}

			return response;
		}

		// 비즈니스 핸들러 실행
		const response = await handler(auth.userId ? { nextRequest, userId: auth.userId } : { nextRequest });

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
		}

		return response;
	};
