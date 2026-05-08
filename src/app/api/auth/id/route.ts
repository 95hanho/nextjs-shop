import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { userWithAuth } from "@/lib/auth/user";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 유저아이디 조회 By인증토큰
export const GET = userWithAuth(async ({ accessToken }) => {
	console.log("[API] 유저아이디 조회 By인증토큰");
	try {
		const data = await getNormal<BaseResponse & { userId: string }>(getBackendUrl(API_URL.AUTH_ID), undefined, {
			Authorization: `Bearer ${accessToken}`,
		});
		// console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
