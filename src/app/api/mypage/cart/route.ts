import API_URL from "@/api/endpoints";
import { getNormal, postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { GetCartResponse, UpdateCartRequest } from "@/types/mypage";
import { NextResponse } from "next/server";

// 장바구니 조회
export const GET = withAuth(async ({ nextRequest }) => {
	try {
		const userId = nextRequest.nextUrl.searchParams.get("userId");
		if (!userId) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });
		const data = await getNormal<GetCartResponse>(getBackendUrl(API_URL.MY_CART), { userId });
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: any) {
		console.error("error :", {
			message: err.message,
			status: err.status,
			data: err.data,
		});

		const status = Number.isInteger(err?.status) ? err.status : 500;
		const payload = err?.data && typeof err.data === "object" ? err.data : { message: err?.message || "SERVER_ERROR" };

		return NextResponse.json(payload, { status });
	}
});
// 장바구니 제품 수량/선택여부 변경
export const POST = withAuth(async ({ nextRequest }) => {
	try {
		const { quantity, selected, cartId }: UpdateCartRequest = await nextRequest.json();
		if (!cartId || !quantity || selected) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });

		const payload: UpdateCartRequest = { quantity, selected, cartId };
		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.MY_CART), { ...payload });
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: any) {
		console.error("error :", {
			message: err.message,
			status: err.status,
			data: err.data,
		});

		const status = Number.isInteger(err?.status) ? err.status : 500;
		const payload = err?.data && typeof err.data === "object" ? err.data : { message: err?.message || "SERVER_ERROR" };

		return NextResponse.json(payload, { status });
	}
});
