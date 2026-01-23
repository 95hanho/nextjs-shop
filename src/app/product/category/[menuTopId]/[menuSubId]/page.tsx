import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import CategoryProductListClient from "./CategoryProductListClient";
import { getApiUrl, getBackendUrl } from "@/lib/getBaseUrl";
import { GetProductListRequest, GetProductListResponse } from "@/types/product";
import { cookies } from "next/headers";

interface ProductListParams {
	params: {
		menuSubId: number;
		menuTopId: number;
	};
	searchParams: {
		page?: string;
		sort?: string;
		keyword?: string;
	};
}

export default async function CategoryProductList({
	params: { menuSubId, menuTopId },
	searchParams: { keyword, page = 1, sort = "latest" },
}: ProductListParams) {
	console.log(menuSubId, menuTopId);

	const accessToken = cookies().get("accessToken")?.value; // HttpOnly 쿠키 OK
	console.log("서버에서 accessToken", accessToken);
	/* ============ */
	menuSubId = 25; // TEST 입력
	/* ============ */
	const payload: GetProductListRequest = {
		sort,
		menuSubId,
		// lastCreatedAt,
		// lastProductId,
		// lastPopularity
	};
	const productResponse: GetProductListResponse = await getNormal(getBackendUrl(API_URL.PRODUCT), payload);
	console.log(productResponse.productList[0]);

	return <CategoryProductListClient productList={productResponse.productList} />;
}
