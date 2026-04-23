import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import CategoryProductListClient from "./CategoryProductListClient";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetProductListRequest, GetProductListResponse } from "@/types/product";
import { cookies, headers } from "next/headers";
import { MenuResponse } from "@/types/main";

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

export default async function CategoryProductList({ params: { menuSubId, menuTopId }, searchParams: { keyword, page = 1 } }: ProductListParams) {
	// const accessToken = cookies().get("accessToken")?.value || headers().get("accessToken") || undefined;
	// console.log("서버에서 accessToken", accessToken);

	// [SSR] 현재 메뉴명을 가져오기 위한
	const menusResponse = await getNormal<MenuResponse>(getBackendUrl(API_URL.MAIN_MENU));
	const menuList = [...menusResponse.menuList].sort((a, b) => a.menuTopId - b.menuTopId);
	// [SSR] 제품 리스트 조회
	const payload: GetProductListRequest = {
		sort: "POPULAR",
		popularPeriod: "ALL",
		menuSubId: Number(menuSubId),
		// lastCreatedAt,
		// lastProductId,
		// lastPopularity
	};
	const productResponse: GetProductListResponse = await getNormal(getBackendUrl(API_URL.PRODUCT), { ...payload });

	// 현재 메뉴명 찾기
	const currentTopMenu = menuList.find((menu) => menu.menuTopId === Number(menuTopId));
	const currentSubMenu = currentTopMenu?.menuSubList.find((sub) => sub.menuSubId === Number(menuSubId));

	/* ============ */
	// menuSubId = 25; // TEST 입력
	/* ============ */

	return (
		<main>
			<CategoryProductListClient
				menuSubId={Number(menuSubId)}
				initialProductListData={productResponse}
				topMenuName={currentTopMenu?.menuName || ""}
				subMenuName={currentSubMenu?.menuName || ""}
			/>
		</main>
	);
}
