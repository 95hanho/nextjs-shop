import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetProductListRequest, GetProductListResponse } from "@/types/product";
import { NextResponse } from "next/server";

// 제품 리스트 조회
export const GET = withAuth(async ({ nextRequest }) => {
	// query 접근 (App Router에서는 req.nextUrl.searchParams)
	const search = Object.fromEntries(nextRequest.nextUrl.searchParams.entries());
	if (Object.keys(search).length > 0) {
		console.log("query:", search);
	}

	try {
		const sort = nextRequest.nextUrl.searchParams.get("sort");
		const menuSubId = Number(nextRequest.nextUrl.searchParams.get("menuSubId"));
		const lastCreatedAt = nextRequest.nextUrl.searchParams.get("lastCreatedAt");
		const lastProductId = Number(nextRequest.nextUrl.searchParams.get("lastProductId"));
		const lastPopularity = Number(nextRequest.nextUrl.searchParams.get("lastPopularity"));
		if (!sort || !menuSubId || !lastCreatedAt || !lastProductId || !lastPopularity)
			return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });

		const payload: GetProductListRequest = { sort, menuSubId, lastCreatedAt, lastProductId, lastPopularity };
		const data = await getNormal<GetProductListResponse>(getBackendUrl(API_URL.PRODUCT), { ...payload });
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
