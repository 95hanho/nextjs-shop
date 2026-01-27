import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, postUrlFormData } from "@/api/fetchFilter";
import { withAdminAuth } from "@/lib/admin/auth";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetUserInfoUnmaskedResponse, GetUserListResponse } from "@/types/admin";
import { NextResponse } from "next/server";

// 회원 조회
export const GET = withAdminAuth(async ({ adminToken }) => {
	try {
		const data = await getNormal<GetUserListResponse>(getBackendUrl(API_URL.ADMIN_USER), undefined, {
			Authorization: `Bearer ${adminToken}`,
		});
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
// 회원 정보 보기(마스킹해제)
export const POST = withAdminAuth(async ({ nextRequest, adminToken }) => {
	try {
		const { userNo }: { userNo: number } = await nextRequest.json();
		if (!userNo) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
		const data = await postUrlFormData<GetUserInfoUnmaskedResponse>(
			getBackendUrl(API_URL.AUTH),
			{ userNo },
			{
				Authorization: `Bearer ${adminToken}`,
			},
		);
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
