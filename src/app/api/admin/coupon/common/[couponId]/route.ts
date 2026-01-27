import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { deleteNormal } from "@/api/fetchFilter";
import { withAdminAuth } from "@/lib/admin/auth";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 공용 쿠폰 삭제
export const DELETE = withAdminAuth<{ couponId: string }>(async ({ params, adminToken }) => {
	try {
		const couponId = Number(params.couponId);
		if (!Number.isInteger(couponId) || couponId <= 0) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const data = await deleteNormal<BaseResponse>(
			getBackendUrl(API_URL.ADMIN_COUPON_COMMON_DELETE),
			{ couponId },
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
