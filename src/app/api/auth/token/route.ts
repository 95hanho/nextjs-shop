// import API_URL from "@/api/endpoints";
// import { getNormal, postUrlFormData, putUrlFormData } from "@/api/fetchFilter";
// import { getBackendUrl } from "@/lib/getBaseUrl";
// import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
// import { ACCESS_TOKEN_COOKIE_AGE, REFRESH_TOKEN_COOKIE_AGE } from "@/lib/tokenTime";
// import { BaseResponse } from "@/types/common";
// import { NextApiRequest, NextApiResponse } from "next";
// import { NextRequest, NextResponse } from "next/server";

// // 토큰 그냥 있는지 확인용
// export async function GET(nextRequest: NextRequest) {
// 	const accessToken = nextRequest.cookies.get("accessToken") || "";
// 	const refreshToken = nextRequest.cookies.get("refreshToken") || "";

// 	return NextResponse.json({ message: "SUCCESS", accessToken, refreshToken }, { status: 200 });
// }
// // 토큰 재생성
// export async function POST(nextRequest: NextRequest) {
// 	try {
// 		// method별 요청처리
// 		const { refreshToken } = await nextRequest.json();
// 		if (!refreshToken) return NextResponse.json({ message: "인증 토큰이 없습니다. 로그인 후 다시 시도해주세요." }, { status: 401 });

// 		const newRefreshToken = generateRefreshToken();
// 		const xffHeader = nextRequest.headers.get("x-forwarded-for");
// 		const ip =
// 			xffHeader?.split(",")[0]?.trim() ??
// 			// 일부 환경에서는 Cloudflare나 Reverse Proxy 헤더 사용
// 			nextRequest.headers.get("x-real-ip") ??
// 			"unknown";

// 		const reTokenData = await putUrlFormData<BaseResponse & { userId: string }>(
// 			getBackendUrl(API_URL.AUTH_TOKEN),
// 			{
// 				beforeToken: refreshToken,
// 				refreshToken: newRefreshToken,
// 			},
// 			{
// 				userAgent: nextRequest.headers.get("user-agent") || "",
// 				["x-forwarded-for"]: ip,
// 			}
// 		);
// 		console.log("reTokenData", reTokenData);

// 		const accessToken = generateAccessToken({ userId: reTokenData.userId });
// 		console.log("accessToken", accessToken.slice(-10), "refreshToken", refreshToken.slice(-10));

// 		const response = NextResponse.json({ message: reTokenData.message }, { status: 200 });
// 		response.headers.set(
// 			"Set-Cookie",
// 			[
// 				`accessToken=${accessToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${ACCESS_TOKEN_COOKIE_AGE}`,
// 				`refreshToken=${newRefreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${REFRESH_TOKEN_COOKIE_AGE}`,
// 			].join(", ")
// 		);
// 		return response;
// 	} catch (err: any) {
// 		console.error("error :", {
// 			message: err.message,
// 			status: err.status,
// 			data: err.data,
// 		});

// 		const status = Number.isInteger(err?.status) ? err.status : 500;
// 		const payload = err?.data && typeof err.data === "object" ? err.data : { message: err?.message || "SERVER_ERROR" };

// 		return NextResponse.json(payload, { status });
// 	}
// }
