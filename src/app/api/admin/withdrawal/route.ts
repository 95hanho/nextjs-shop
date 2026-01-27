import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData } from "@/api/fetchFilter";
import { withAdminAuth } from "@/lib/admin/auth";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { UserWithdrawalStatusRequest } from "@/types/admin";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 회원 탈퇴 확정하기
export const POST = withAdminAuth(async ({ nextRequest, adminToken }) => {
	try {
		const { userNoList, withdrawalStatus }: UserWithdrawalStatusRequest = await nextRequest.json();
		if (!userNoList || !userNoList.length || !withdrawalStatus) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: UserWithdrawalStatusRequest = { userNoList, withdrawalStatus };
		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.ADMIN_USER_WITHDRAWAL),
			{ ...payload },
			{
				Authorization: `Bearer ${adminToken}`,
			},
		);
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
