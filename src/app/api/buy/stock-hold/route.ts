import API_URL from "@/api/endpoints";
import { getNormal, postJson } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BuyHoldReleaseResponse, BuyHoldRequest, BuyHoldResponse, BuyItem } from "@/types/buy";
import { NextResponse } from "next/server";

// 상품 확인 및 점유(장비구니, 상품상세보기에서 구매페이지이동 시)
// FE : 10분 안에 아무 동작도 없고 결제도 안하고 하면 알람
export const POST = withAuth(async ({ nextRequest, accessToken }) => {
	try {
		const { buyList }: { buyList: BuyItem[] } = await nextRequest.json();

		if (buyList.length === 0) return NextResponse.json({ message: "구매 상품이 없습니다." }, { status: 400 });

		const payload: BuyHoldRequest = { buyList };
		const data = await postJson<BuyHoldResponse, BuyHoldRequest>(
			getBackendUrl(API_URL.BUY_HOLD),
			{ ...payload },
			{
				Authorization: `Bearer ${accessToken}`,
			}
		);
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
export const DELETE = withAuth(async ({ nextRequest, userId, accessToken }) => {
	// query 접근 (App Router에서는 req.nextUrl.searchParams)
	const search = Object.fromEntries(nextRequest.nextUrl.searchParams.entries());
	if (Object.keys(search).length > 0) {
		console.log("query:", search);
	}

	try {
		const holdIds = nextRequest.nextUrl.searchParams.getAll("cartIdList").map(Number);

		if (!userId) return NextResponse.json({ message: "아이디를 입력해주세요." }, { status: 400 });

		const data = await getNormal<BuyHoldReleaseResponse>(
			getBackendUrl(API_URL.BUY_PAY),
			{ holdIds },
			{
				Authorization: `Bearer ${accessToken}`,
			}
		);
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
