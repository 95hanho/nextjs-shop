import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

// 유저아이디 조회 By인증토큰
export const GET = withAuth(async ({ accessToken }) => {
	try {
		const data = await getNormal<BaseResponse & { userId: string }>(getBackendUrl(API_URL.AUTH_ID), undefined, {
			Authorization: `Bearer ${accessToken}`,
		});
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
// 아이디 중복확인
export const POST = async (nextRequest: NextRequest) => {
	try {
		const { userId } = await nextRequest.json();
		if (!userId) return NextResponse.json({ message: "아이디를 입력해주세요." }, { status: 400 });
		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.AUTH_ID), { userId });
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
};
