import { getNormal, postUrlFormData, putUrlFormData } from "@/api/fetchFilter";
import { cookies } from "next/headers";
import { getApiUrl, getBackendUrl } from "./getBaseUrl";
import API_URL from "@/api/endpoints";
import { Token, UserResponse } from "@/types/auth";
import { NextRequest, NextResponse } from "next/server";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, verifyToken } from "./jwt";
import { BaseResponse } from "@/types/common";
import { isProd } from "./env";
import { ACCESS_TOKEN_COOKIE_AGE, REFRESH_TOKEN_COOKIE_AGE } from "./tokenTime";

/** 처음페이지로드 시 accessToken있으면 유저 정보 가져옴 */
export async function getServerSession() {
	const accessToken = (await cookies()).get("accessToken")?.value;
	if (!accessToken) return null;
	console.log("서버->서버로 유저정보 요청!!");
	const data = await getNormal<UserResponse>(getApiUrl(API_URL.AUTH), undefined, {
		Cookie: `accessToken=${accessToken}`,
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
			userNo?: number;
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
	console.log("authFromTokens -----------", accessToken?.slice(-10), refreshToken?.slice(-10));

	// 1) accessToken 유효하면 그대로 통과
	if (accessToken?.trim()) {
		try {
			const token: Token = verifyToken(accessToken);
			return { ok: true, userNo: token.userNo };
		} catch {
			// accessToken 만료 → 아래에서 refreshToken으로 처리
			console.warn("만료됨!!!");
		}
	}

	// 2) refreshToken도 없으면 완전 로그아웃 상태
	if (!refreshToken?.trim()) {
		return {
			ok: true,
		};
	}

	// 3) refreshToken 검증
	try {
		verifyRefreshToken(refreshToken);
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

	const reTokenData = await postUrlFormData<BaseResponse & { userNo: number }>(
		getBackendUrl(API_URL.AUTH_TOKEN_REFRESH),
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

	const newAccessToken = generateAccessToken({ userNo: reTokenData.userNo });
	console.log("newAccessToken", newAccessToken.slice(-10), "newRefreshToken", newRefreshToken.slice(-10));

	return {
		ok: true,
		userNo: reTokenData.userNo,
		newAccessToken,
		newRefreshToken,
	};
};
//
type HandlerWithAuth = (ctx: {
	nextRequest: NextRequest;
	userNo: number; // ✅ 인증 성공이면 필수로 두는 게 좋아
	accessToken: string; // ✅ Spring에 보낼 토큰
	params?: { [key: string]: string }; // 🔹 여기에 params 추가
}) => Promise<NextResponse> | NextResponse;
//
export const withAuth =
	(handler: HandlerWithAuth) =>
	async (
		nextRequest: NextRequest,
		context?: { params?: { [key: string]: string } } // 🔹 App Router의 context 받기
	): Promise<NextResponse> => {
		const auth = await authFromTokens(nextRequest);

		if (!auth.ok) {
			const response = NextResponse.json({ message: auth.message }, { status: auth.status });

			if (auth.clearCookies) {
				console.warn("토큰지워!!!!");
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
			}

			return response;
		}

		// ✅ “이번 요청에서 Spring에 보낼 accessToken” 결정
		const accessToken = auth.newAccessToken ?? nextRequest.cookies.get("accessToken")?.value;

		if (!accessToken || !auth.userNo) {
			return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
		}

		// 🔹 비즈니스 핸들러 실행할 때 params도 함께 넘겨주기
		const baseCtx = {
			nextRequest,
			userNo: auth.userNo,
			accessToken,
			params: context?.params, // 없으면 undefined
		};

		/* API 실행 전 --------------------------------> */

		const response = await handler(baseCtx);

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
			console.log("토큰 다시 세팅 !!!! ---------------------", nextRequest.url);
		}
		console.log(
			"accessToken11111",
			auth.newAccessToken || nextRequest.cookies.get("accessToken")?.value || response.cookies.get("accessToken")?.value
		);

		return response;
	};
