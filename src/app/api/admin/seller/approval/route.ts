import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData } from "@/api/fetchFilter";
import { withAdminAuth } from "@/lib/admin/auth";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { SetSellerApprovalRequest } from "@/types/admin";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 판매자 승인여부 변경
export const POST = withAdminAuth(async ({ nextRequest, adminToken }) => {
	try {
		const { sellerNoList, approvalStatus, rejectReason }: SetSellerApprovalRequest = await nextRequest.json();
		if (!sellerNoList || !sellerNoList.length) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
		if (!approvalStatus) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
		if (approvalStatus === "REJECTED" && !rejectReason) return NextResponse.json({ message: "비밀번호를 입력해주세요." }, { status: 400 });

		const payload: SetSellerApprovalRequest = { sellerNoList, approvalStatus };
		if (rejectReason) payload.rejectReason = rejectReason;
		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.ADMIN_SELLER_APPROVAL),
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
