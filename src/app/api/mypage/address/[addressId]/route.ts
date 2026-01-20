import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { deleteNormal } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 유저배송지 삭제
export const DELETE = withAuth(async ({ params, accessToken }) => {
	try {
		const { addressId } = params ?? {};
		if (!addressId) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });

		const data = await deleteNormal<BaseResponse>(
			getBackendUrl(API_URL.MY_ADDRESS_DELETE),
			{ addressId },
			{
				Authorization: `Bearer ${accessToken}`,
			}
		);
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
