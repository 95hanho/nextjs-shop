import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { getNumberParam, getStringParam } from "@/lib/param";
import { GetProductListRequest, GetProductListResponse } from "@/types/product";
import { NextResponse } from "next/server";

// 제품 리스트 조회(안씀)
/*
export const GET = withAuth(async ({ nextRequest, accessToken }) => {
	// query 접근 (App Router에서는 req.nextUrl.searchParams)
	const search = Object.fromEntries(nextRequest.nextUrl.searchParams.entries());
	if (Object.keys(search).length > 0) {
		console.log("query:", search);
	}

	try {
		const sort = nextRequest.nextUrl.searchParams.get("sort");
		const menuSubId = Number(nextRequest.nextUrl.searchParams.get("menuSubId"));
		if (!sort || !menuSubId) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: GetProductListRequest = {
			sort,
			menuSubId,
			lastCreatedAt: getStringParam(nextRequest, "lastCreatedAt"),
			lastProductId: getNumberParam(nextRequest, "lastProductId"),
			lastPopularity: getNumberParam(nextRequest, "lastPopularity"),
		};
		const data = await getNormal<GetProductListResponse>(
			getBackendUrl(API_URL.PRODUCT),
			{ ...payload },
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
*/
