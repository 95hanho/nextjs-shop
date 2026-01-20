import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetWishListResponse } from "@/types/mypage";
import { NextResponse } from "next/server";

// 위시리스트 조회
export const GET = withAuth(async ({ userId, accessToken }) => {
	try {
		if (!userId) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });

		const data = await getNormal<GetWishListResponse>(
			getBackendUrl(API_URL.MY_WISH),
			{ userId },
			{
				Authorization: `Bearer ${accessToken}`,
			}
		);
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
