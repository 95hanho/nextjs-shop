import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

// 아이디 중복확인
export const GET = async (nextRequest: NextRequest) => {
	console.log("[API] 아이디 중복확인");
	try {
		const userId = nextRequest.nextUrl.searchParams.get("userId");
		if (!userId) return NextResponse.json({ message: "아이디를 입력해주세요." }, { status: 400 });

		const data = await getNormal<BaseResponse>(getBackendUrl(API_URL.AUTH_ID_DUPLICATE), { userId });
		// console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
};
