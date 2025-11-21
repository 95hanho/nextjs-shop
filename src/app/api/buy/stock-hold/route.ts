import API_URL from "@/api/endpoints";
import { getNormal, postJson } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BuyHoldRequest, BuyHoldResponse, BuyItem } from "@/types/buy";
import { NextResponse } from "next/server";

// 상품 확인 및 점유(장비구니, 상품상세보기에서 구매페이지이동 시)
// FE : 10분 안에 아무 동작도 없고 결제도 안하고 하면 알람
export const POST = withAuth(async ({ nextRequest, userId }) => {
	try {
		const { buyList }: { buyList: BuyItem[] } = await nextRequest.json();

		if (buyList.length === 0) return NextResponse.json({ message: "구매 상품이 없습니다." }, { status: 400 });

		if (!userId) return NextResponse.json({ message: "인증 정보가 없습니다. 로그인 후 다시 시도해주세요." }, { status: 401 });

		const payload: BuyHoldRequest = { userId, buyList };
		const data = await postJson<BuyHoldResponse, BuyHoldRequest>(getBackendUrl(API_URL.BUY_HOLD), { ...payload });
		console.log("data", data);

		return NextResponse.json({ message: data.message, holds: data.holds }, { status: 200 });
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
// 점유 해제
export const DELETE = withAuth(async ({ nextRequest, userId }) => {
	// query 접근 (App Router에서는 req.nextUrl.searchParams)
	const search = Object.fromEntries(nextRequest.nextUrl.searchParams.entries());
	if (Object.keys(search).length > 0) {
		console.log("query:", search);
	}

	try {
		if (!userId) return NextResponse.json({ message: "아이디를 입력해주세요." }, { status: 400 });

		const stockHoldData = await getNormal<BaseResponse>(getBackendUrl(API_URL.BUY_PAY), { userId });
		console.log("data", stockHoldData);

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
