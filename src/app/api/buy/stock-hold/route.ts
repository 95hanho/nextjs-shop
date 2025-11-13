import API_URL from "@/api/endpoints";
import { postUrlFormData } from "@/api/fetchFilter";
import { getServerUrl } from "@/lib/getBaseUrl";
import { verifyToken } from "@/lib/jwt";
import { BuyHoldRequest, BuyItem } from "@/types/buy";
import { BaseResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

// 상품 확인 및 점유(장비구니, 상품상세보기에서 구매페이지이동 시)
// FE : 10분 안에 아무 동작도 없고 결제도 안하고 하면 알람
export async function POST(nextRequest: NextRequest) {
	console.log("url :", nextRequest.url);

	try {
		const { buyList }: { buyList: BuyItem[] } = await nextRequest.json();

		if (buyList.length === 0) return NextResponse.json({ message: "구매 상품이 없습니다." }, { status: 400 });

		const accessToken = nextRequest.cookies.get("accessToken")?.value;
		if (!accessToken) return NextResponse.json({ message: "인증 정보가 없습니다. 로그인 후 다시 시도해주세요." }, { status: 401 });
		const token = verifyToken(accessToken);
		const userId = token.userId as string;

		const payload: BuyHoldRequest = { userId, buyList };
		const data = await postUrlFormData<BaseResponse>(getServerUrl(API_URL.BUY_HOLD), { ...payload });
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
}
// 점유 해제
// export async function DELETE(nextRequest: NextRequest) {
// 	console.log("url :", nextRequest.url);

// 	try {
// 		// return NextResponse.json({ message: data.message }, { status: 200 });
// 	} catch (err: any) {
// 		console.error("error :", {
// 			message: err.message,
// 			status: err.status,
// 			data: err.data,
// 		});

// 		const status = Number.isInteger(err?.status) ? err.status : 500;
// 		const payload = err?.data && typeof err.data === "object" ? err.data : { message: err?.message || "SERVER_ERROR" };

// 		return NextResponse.json(payload, { status });
// 	}
// }
