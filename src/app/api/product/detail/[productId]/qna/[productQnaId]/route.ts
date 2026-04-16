import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { deleteNormal } from "@/api/fetchFilter";
import { userWithAuth } from "@/lib/auth/user";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

// 제품 상품 Q&A 삭제
export const DELETE = userWithAuth<{ productId: string; productQnaId: string }>(async ({ accessToken, params }) => {
	console.log("[API] 제품 상품 Q&A 삭제");
	try {
		const productId = Number(params.productId);
		const productQnaId = Number(params.productQnaId);
		if (!productId || !Number.isInteger(productId)) return NextResponse.json({ message: "productId is required" }, { status: 400 });
		if (!productQnaId || !Number.isInteger(productQnaId)) return NextResponse.json({ message: "productQnaId is required" }, { status: 400 });

		const data = await deleteNormal<BaseResponse>(
			getBackendUrl(API_URL.PRODUCT_DETAIL_QNA_DELETE),
			{ productId, productQnaId },
			{ Authorization: `Bearer ${accessToken}` },
		);
		// console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
