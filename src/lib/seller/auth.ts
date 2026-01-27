import { putUrlFormData } from "@/api/fetchFilter";
import { getBackendUrl } from "../getBaseUrl";
import API_URL from "@/api/endpoints";
import { NextRequest, NextResponse } from "next/server";
import { generateRefreshToken, verifyRefreshToken } from "../jwt";
import { BaseResponse } from "@/types/common";
import { isProd } from "../env";
import { REFRESH_TOKEN_COOKIE_AGE, SELLER_TOKEN_COOKIE_AGE } from "../tokenTime";
import { generateSellerToken, verifySellerToken } from "@/lib/seller/jwt";
import { Token } from "@/types/token";

type AutoRefreshResult =
	| {
			ok: true;
			sellerNo?: number;
			newSellerToken?: string;
			newSellerRefreshToken?: string;
	  }
	| {
			ok: false;
			status: number;
			message: string;
			clearCookies?: boolean;
	  };

// API동작 시 sellerRefreshToken은 있는데 sellerToken가 없을 때 재발급 해주기 위해서 사용
const authFromSellerTokens = async (nextRequest: NextRequest): Promise<AutoRefreshResult> => {
	const sellerToken = nextRequest.cookies.get("sellerToken")?.value || nextRequest.headers.get("sellerToken") || undefined;
	const sellerRefreshToken = nextRequest.cookies.get("sellerRefreshToken")?.value || nextRequest.headers.get("sellerRefreshToken") || undefined;
	console.log("authFromSellerTokens -----------", sellerToken?.slice(-10), sellerRefreshToken?.slice(-10));

	// 1) sellerToken 유효하면 그대로 통과
	if (sellerToken?.trim()) {
		try {
			const token: Token = verifySellerToken(sellerToken);
			return { ok: true, sellerNo: token.sellerNo };
		} catch {
			// sellerToken 만료 → 아래에서 sellerRefreshToken으로 처리
			console.warn("만료됨!!!");
		}
	}

	// 2) sellerRefreshToken도 없으면 완전 로그아웃 상태
	if (!sellerRefreshToken?.trim()) {
		return {
			ok: true,
		};
	}

	// 3) sellerRefreshToken 검증
	try {
		verifyRefreshToken(sellerRefreshToken);
	} catch {
		return {
			ok: false,
			status: 401,
			message: "REFRESH_UNAUTHORIZED",
			clearCookies: true,
		};
	}
	// 4) sellerRefreshToken 유효 → 백엔드에 토큰 갱신 요청
	const newSellerRefreshToken = generateRefreshToken();
	const xffHeader = nextRequest.headers.get("x-forwarded-for");
	const ip =
		xffHeader?.split(",")[0]?.trim() ??
		// 일부 환경에서는 Cloudflare나 Reverse Proxy 헤더 사용
		nextRequest.headers.get("x-real-ip") ??
		"unknown";

	const reTokenData = await putUrlFormData<BaseResponse & { sellerNo: number }>(
		getBackendUrl(API_URL.SELLER_TOKEN_REFRESH),
		{
			beforeToken: sellerRefreshToken,
			sellerRefreshToken: newSellerRefreshToken,
		},
		{
			userAgent: nextRequest.headers.get("user-agent") || "",
			["x-forwarded-for"]: ip,
		},
	);
	console.log("reTokenData", reTokenData);

	const newSellerToken = generateSellerToken({ sellerNo: reTokenData.sellerNo });
	console.log("newSellerToken", newSellerToken.slice(-10), "newSellerRefreshToken", newSellerRefreshToken.slice(-10));

	return {
		ok: true,
		sellerNo: reTokenData.sellerNo,
		newSellerToken,
		newSellerRefreshToken,
	};
};
//
export type SellerHandler<TParams extends Record<string, string> = Record<string, never>> = (ctx: {
	nextRequest: NextRequest;
	sellerNo: number;
	sellerToken: string;
	params: TParams;
}) => Promise<NextResponse>;
//
export const withSellerAuth =
	<TParams extends Record<string, string> = Record<string, never>>(handler: SellerHandler<TParams>) =>
	async (nextRequest: NextRequest, context: { params: TParams }): Promise<NextResponse> => {
		const auth = await authFromSellerTokens(nextRequest);

		if (!auth.ok) {
			const response = NextResponse.json({ message: auth.message }, { status: auth.status });

			if (auth.clearCookies) {
				console.warn("토큰지워!!!!");
				response.cookies.set("sellerToken", "", {
					httpOnly: true,
					secure: isProd,
					sameSite: "strict",
					path: "/",
					maxAge: 0,
				});
				response.cookies.set("sellerRefreshToken", "", {
					httpOnly: true,
					secure: isProd,
					sameSite: "strict",
					path: "/",
					maxAge: 0,
				});
			}

			return response;
		}

		// ✅ “이번 요청에서 Spring에 보낼 sellerToken” 결정
		const sellerToken = auth.newSellerToken ?? nextRequest.cookies.get("sellerToken")?.value;

		if (!sellerToken || !auth.sellerNo) {
			return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
		}

		/* API 실행 전 --------------------------------> */

		const response = await handler({
			nextRequest,
			sellerNo: auth.sellerNo,
			sellerToken,
			params: context.params,
		});

		/* API 실행 후 --------------------------------> */

		// 토큰 재발급된 경우 쿠키 세팅
		if (auth.newSellerToken && auth.newSellerRefreshToken) {
			response.cookies.set("sellerToken", auth.newSellerToken, {
				httpOnly: true,
				secure: isProd,
				sameSite: "strict",
				path: "/",
				maxAge: SELLER_TOKEN_COOKIE_AGE,
			});
			response.cookies.set("sellerRefreshToken", auth.newSellerRefreshToken, {
				httpOnly: true,
				secure: isProd,
				sameSite: "strict",
				path: "/",
				maxAge: REFRESH_TOKEN_COOKIE_AGE,
			});
			console.log("토큰 다시 세팅 !!!! ---------------------", nextRequest.url);
		}
		console.log(
			"sellerToken11111",
			auth.newSellerToken || nextRequest.cookies.get("sellerToken")?.value || response.cookies.get("sellerToken")?.value,
		);

		return response;
	};
