import API_URL from "@/api/endpoints";
import { getNormal, postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { getStockHoldProductResponse } from "@/types/buy";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

/*  */
// 점유 중인 상품 및 사용 가능 쿠폰 조회
export const GET = withAuth(async ({ accessToken }) => {
	try {
		const data = await getNormal<getStockHoldProductResponse>(getBackendUrl(API_URL.BUY_PAY), undefined, {
			Authorization: `Bearer ${accessToken}`,
		});
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
// 상품 구매/결제
export const POST = withAuth(async ({ nextRequest, userId, params }) => {
	try {
		const {} = params ?? {};
		// formdata || application/x-www-form-urlencoded로 보내면 이렇게
		// const formData = await nextRequest.formData();
		// const userId = formData.get("userId");
		// const password = formData.get("password");
		// json으로 받으면
		const { userId, password } = await nextRequest.json();
		if (!userId) return NextResponse.json({ message: "아이디를 입력해주세요." }, { status: 400 });
		if (!password) return NextResponse.json({ message: "비밀번호를 입력해주세요." }, { status: 400 });
		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.AUTH), { userId, password });
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
