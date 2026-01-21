// 판매자 정보조회
// - 초기패이지로딩(로그인되어있을 때), 로그인, 로그아웃, 관리자정보필요할 때, 관리자정보수정(상태변화)

import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, postUrlFormData } from "@/api/fetchFilter";
import { withAdminAuth } from "@/lib/admin/auth";
import { generateAdminToken } from "@/lib/admin/jwt";
import { isProd } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { generateRefreshToken } from "@/lib/jwt";
import { ADMIN_TOKEN_COOKIE_AGE, REFRESH_TOKEN_COOKIE_AGE } from "@/lib/tokenTime";
import { AdminLoginForm, AdminLoginResponse, AdminResponse } from "@/types/admin";
import { BaseResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

// 관리자 정보조회
// - 초기패이지로딩(로그인되어있을 때), 로그인, 로그아웃, 관리자정보필요할 때, 관리자정보수정(상태변화)
// 할 때 바로 가져올 수 있게 useQuery 실행함.
export const GET = withAdminAuth(async ({ adminToken }) => {
	try {
		const data = await getNormal<AdminResponse>(getBackendUrl(API_URL.ADMIN), {
			Authorization: `Bearer ${adminToken}`,
		});
		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});

// 판매자 로그인
export const POST = async (nextRequest: NextRequest) => {
	try {
		const { adminId, password }: AdminLoginForm = await nextRequest.json();
		if (!adminId) return NextResponse.json({ message: "아이디를 입력해주세요." }, { status: 400 });
		if (!password) return NextResponse.json({ message: "비밀번호를 입력해주세요." }, { status: 400 });

		const loginValidateData = await postUrlFormData<AdminLoginResponse>(getBackendUrl(API_URL.ADMIN), { adminId, password });
		console.log("loginValidateData", loginValidateData);

		// ✅ HttpOnly 쿠키 설정
		const adminToken = generateAdminToken({ adminNo: loginValidateData.adminNo });
		const adminRefreshToken = generateRefreshToken();
		console.log("adminToken", adminToken);
		console.log("adminRefreshToken", adminRefreshToken);

		const xffHeader = nextRequest.headers.get("x-forwarded-for");
		const ip =
			xffHeader?.split(",")[0]?.trim() ??
			// 일부 환경에서는 Cloudflare나 Reverse Proxy 헤더 사용
			nextRequest.headers.get("x-real-ip") ??
			"unknown";

		// 토큰 저장하기 : refreshToken랑 정보랑 관리자 agent, ip 정보 보내기
		await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.ADMIN_TOKEN),
			{ refreshToken: adminRefreshToken },
			{
				Authorization: `Bearer ${adminToken}`,
				userAgent: nextRequest.headers.get("user-agent") || "",
				["x-forwarded-for"]: ip,
			},
		);
		const response = NextResponse.json({ message: "ADMIN_LOGIN_SUCCESS" }, { status: 200 });
		response.cookies.set("adminToken", adminToken, {
			httpOnly: true,
			secure: isProd,
			sameSite: "strict",
			path: "/",
			maxAge: ADMIN_TOKEN_COOKIE_AGE,
		});
		response.cookies.set("adminRefreshToken", adminRefreshToken, {
			httpOnly: true,
			secure: isProd,
			sameSite: "strict",
			path: "/",
			maxAge: REFRESH_TOKEN_COOKIE_AGE,
		});

		return response;
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
};
