import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 위시 등록/해제
export const POST = withAuth(async ({ nextRequest, accessToken }) => {
	try {
		const { productId }: { productId: number } = await nextRequest.json();

		if (!productId) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.PRODUCT_WISH),
			{ productId },
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);
		// console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
