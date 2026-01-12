import API_URL from "@/api/endpoints";
import { postUrlFormData } from "@/api/fetchFilter";
import { isProd } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { generateRefreshToken, generateSellerToken } from "@/lib/jwt";
import { REFRESH_TOKEN_COOKIE_AGE, SELLER_TOKEN_COOKIE_AGE } from "@/lib/tokenTime";
import { BaseResponse } from "@/types/common";
import { SellerLoginForm } from "@/types/seller";
import { NextRequest, NextResponse } from "next/server";

// 판매자 로그인
export const POST = async (nextRequest: NextRequest) => {
	try {
		const { sellerId, password }: SellerLoginForm = await nextRequest.json();
		if (!sellerId) return NextResponse.json({ message: "아이디를 입력해주세요." }, { status: 400 });
		if (!password) return NextResponse.json({ message: "비밀번호를 입력해주세요." }, { status: 400 });

		const loginValidateData = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.SELLER), { sellerId, password });
		console.log("loginValidateData", loginValidateData);

		// ✅ HttpOnly 쿠키 설정
		const sellerToken = generateSellerToken({ sellerId });
		const sellerRefreshToken = generateRefreshToken();
		console.log("sellerToken", sellerToken);
		console.log("sellerRefreshToken", sellerRefreshToken.slice(-10));

		const xffHeader = nextRequest.headers.get("x-forwarded-for");
		const ip =
			xffHeader?.split(",")[0]?.trim() ??
			// 일부 환경에서는 Cloudflare나 Reverse Proxy 헤더 사용
			nextRequest.headers.get("x-real-ip") ??
			"unknown";

		// 토큰 저장하기 : refreshToken랑 정보랑 유저 agent, ip 정보 보내기
		await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.SELLER_TOKEN),
			{ refreshToken: sellerRefreshToken },
			{
				Authorization: `Bearer ${sellerToken}`,
				userAgent: nextRequest.headers.get("user-agent") || "",
				["x-forwarded-for"]: ip,
			}
		);
		const response = NextResponse.json({ message: "SELLER_LOGIN_SUCCESS" }, { status: 200 });
		response.cookies.set("sellerToken", sellerToken, {
			httpOnly: true,
			secure: isProd,
			sameSite: "strict",
			path: "/",
			maxAge: SELLER_TOKEN_COOKIE_AGE,
		});
		response.cookies.set("sellerRefreshToken", sellerRefreshToken, {
			httpOnly: true,
			secure: isProd,
			sameSite: "strict",
			path: "/",
			maxAge: REFRESH_TOKEN_COOKIE_AGE,
		});

		return response;
	} catch (err: any) {
		console.error("error :", {
			message: err.message,
			status: err.status,
			data: err.data,
		});

		const status = Number.isInteger(err?.status) ? err.status : 500;
		const payload = err?.data && typeof err.data === "object" ? err.data : { message: err?.message || "SERVER_ERROR" };

		return NextResponse.json(payload, { status });
	}
};
