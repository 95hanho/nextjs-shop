import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetWishListResponse } from "@/types/mypage";
import { NextResponse } from "next/server";

// 위시리스트 조회
export const GET = withAuth(async ({ userId }) => {
	try {
		if (!userId) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });

		const data = await getNormal<GetWishListResponse>(getBackendUrl(API_URL.MY_WISH), { userId });
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
