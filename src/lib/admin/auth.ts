import { putUrlFormData } from "@/api/fetchFilter";
import { getBackendUrl } from "../getBaseUrl";
import API_URL from "@/api/endpoints";
import { NextRequest, NextResponse } from "next/server";
import { generateRefreshToken, verifyRefreshToken } from "../jwt";
import { BaseResponse } from "@/types/common";
import { isProd } from "../env";
import { ACCESS_TOKEN_COOKIE_AGE, REFRESH_TOKEN_COOKIE_AGE } from "../tokenTime";
import { generateAdminToken, verifyAdminToken } from "@/lib/admin/jwt";
import { AdminToken } from "@/types/admin";

type AutoRefreshResult =
	| {
			ok: true;
			adminNo?: number;
			newAdminToken?: string;
			newAdminRefreshToken?: string;
	  }
	| {
			ok: false;
			status: number;
			message: string;
			clearCookies?: boolean;
	  };

// API동작 시 adminRefreshToken은 있는데 adminToken가 없을 때 재발급 해주기 위해서 사용
const authFromAdminTokens = async (nextRequest: NextRequest): Promise<AutoRefreshResult> => {
	const adminToken = nextRequest.cookies.get("adminToken")?.value || nextRequest.headers.get("adminToken") || undefined;
	const adminRefreshToken = nextRequest.cookies.get("adminRefreshToken")?.value || nextRequest.headers.get("adminRefreshToken") || undefined;
	console.log("authFromAdminTokens -----------", adminToken?.slice(-10), adminRefreshToken?.slice(-10));

	// 1) adminToken 유효하면 그대로 통과
	if (adminToken?.trim()) {
		try {
			const token: AdminToken = verifyAdminToken(adminToken);
			return { ok: true, adminNo: token.adminNo };
		} catch {
			// adminToken 만료 → 아래에서 adminRefreshToken으로 처리
			console.warn("만료됨!!!");
		}
	}

	// 2) adminRefreshToken도 없으면 완전 로그아웃 상태
	if (!adminRefreshToken?.trim()) {
		return {
			ok: true,
		};
	}

	// 3) adminRefreshToken 검증
	try {
		verifyRefreshToken(adminRefreshToken);
	} catch {
		return {
			ok: false,
			status: 401,
			message: "REFRESH_UNAUTHORIZED",
			clearCookies: true,
		};
	}
	// 4) adminRefreshToken 유효 → 백엔드에 토큰 갱신 요청
	const newAdminRefreshToken = generateRefreshToken();
	const xffHeader = nextRequest.headers.get("x-forwarded-for");
	const ip =
		xffHeader?.split(",")[0]?.trim() ??
		// 일부 환경에서는 Cloudflare나 Reverse Proxy 헤더 사용
		nextRequest.headers.get("x-real-ip") ??
		"unknown";

	const reTokenData = await putUrlFormData<BaseResponse & { adminNo: number }>(
		getBackendUrl(API_URL.SELLER_TOKEN),
		{
			beforeToken: adminRefreshToken,
			adminRefreshToken: newAdminRefreshToken,
		},
		{
			userAgent: nextRequest.headers.get("user-agent") || "",
			["x-forwarded-for"]: ip,
		},
	);
	console.log("reTokenData", reTokenData);

	const newAdminToken = generateAdminToken({ adminNo: reTokenData.adminNo });
	console.log("newAdminToken", newAdminToken.slice(-10), "newAdminRefreshToken", newAdminRefreshToken.slice(-10));

	return {
		ok: true,
		adminNo: reTokenData.adminNo,
		newAdminToken,
		newAdminRefreshToken,
	};
};
//
type HandlerWithAuth = (ctx: {
	nextRequest: NextRequest;
	adminNo: number; // ✅ 인증 성공이면 필수로 두는 게 좋아
	adminToken: string; // ✅ Spring에 보낼 토큰
	params?: { [key: string]: string }; // 🔹 여기에 params 추가
}) => Promise<NextResponse> | NextResponse;
//
export const withAdminAuth =
	(handler: HandlerWithAuth) =>
	async (
		nextRequest: NextRequest,
		context?: { params?: { [key: string]: string } }, // 🔹 App Router의 context 받기
	): Promise<NextResponse> => {
		const auth = await authFromAdminTokens(nextRequest);

		if (!auth.ok) {
			const response = NextResponse.json({ message: auth.message }, { status: auth.status });

			if (auth.clearCookies) {
				console.warn("토큰지워!!!!");
				response.cookies.set("adminToken", "", {
					httpOnly: true,
					secure: isProd,
					sameSite: "strict",
					path: "/",
					maxAge: 0,
				});
				response.cookies.set("adminRefreshToken", "", {
					httpOnly: true,
					secure: isProd,
					sameSite: "strict",
					path: "/",
					maxAge: 0,
				});
			}

			return response;
		}

		// ✅ “이번 요청에서 Spring에 보낼 adminToken” 결정
		const adminToken = auth.newAdminToken ?? nextRequest.cookies.get("adminToken")?.value;

		if (!adminToken || !auth.adminNo) {
			return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
		}

		// 🔹 비즈니스 핸들러 실행할 때 params도 함께 넘겨주기
		const baseCtx = {
			nextRequest,
			adminNo: auth.adminNo,
			adminToken,
			params: context?.params, // 없으면 undefined
		};

		/* API 실행 전 --------------------------------> */

		const response = await handler(baseCtx);

		/* API 실행 후 --------------------------------> */

		// 토큰 재발급된 경우 쿠키 세팅
		if (auth.newAdminToken && auth.newAdminRefreshToken) {
			response.cookies.set("adminToken", auth.newAdminToken, {
				httpOnly: true,
				secure: isProd,
				sameSite: "strict",
				path: "/",
				maxAge: ACCESS_TOKEN_COOKIE_AGE,
			});
			response.cookies.set("adminRefreshToken", auth.newAdminRefreshToken, {
				httpOnly: true,
				secure: isProd,
				sameSite: "strict",
				path: "/",
				maxAge: REFRESH_TOKEN_COOKIE_AGE,
			});
			console.log("토큰 다시 세팅 !!!! ---------------------", nextRequest.url);
		}
		console.log(
			"adminToken11111",
			auth.newAdminToken || nextRequest.cookies.get("adminToken")?.value || response.cookies.get("adminToken")?.value,
		);

		return response;
	};
