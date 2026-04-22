import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { userWithOptionalAuth } from "@/lib/auth/user";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { popularPeriodOptionCodes, sortOptionCodes } from "@/lib/product";
import { GetProductListRequest, GetProductListResponse, ProductPopularPeriodOption, ProductSortOption } from "@/types/product";
import { NextResponse } from "next/server";

// 제품리스트 조회
export const GET = userWithOptionalAuth(async ({ nextRequest }) => {
	console.log("[API] 제품리스트 조회");
	try {
		const searchParams = nextRequest.nextUrl.searchParams;

		const menuSubIdRaw = searchParams.get("menuSubId");
		const sort = (searchParams.get("sort") as ProductSortOption) || "POPULAR";
		const popularPeriod = (searchParams.get("popularPeriod") as ProductPopularPeriodOption) || "DAYS_7";

		const lastProductIdRaw = searchParams.get("lastProductId");
		const lastCreatedAt = searchParams.get("lastCreatedAt") || undefined;
		const lastPopularityRaw = searchParams.get("lastPopularity");
		const lastPriceRaw = searchParams.get("lastPrice");

		if (!menuSubIdRaw || !sortOptionCodes.includes(sort) || !popularPeriodOptionCodes.includes(popularPeriod)) {
			return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
		}

		const payload: GetProductListRequest = {
			menuSubId: Number(menuSubIdRaw),
			sort,
			popularPeriod: sort === "POPULAR" ? popularPeriod : undefined,
			lastProductId: lastProductIdRaw ? Number(lastProductIdRaw) : undefined,
			lastCreatedAt,
			lastPopularity: lastPopularityRaw ? Number(lastPopularityRaw) : undefined,
			lastPrice: lastPriceRaw ? Number(lastPriceRaw) : undefined,
		};
		const data = await getNormal<GetProductListResponse>(getBackendUrl(API_URL.PRODUCT), { ...payload });

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
