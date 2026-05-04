import API_URL from "@/api/endpoints";
import { getCached } from "@/api/fetchFilter";
import CategoryProductListClient from "./CategoryProductListClient";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetProductListRequest, GetProductListResponse } from "@/types/product";
import { MenuResponse } from "@/types/main";

export const revalidate = 60;

export async function generateStaticParams() {
	console.log("[SSG] category generateStaticParams 실행");

	const menusResponse = await getCached<MenuResponse>(getBackendUrl(API_URL.MAIN_MENU));

	return menusResponse.menuList.flatMap((topMenu) =>
		topMenu.menuSubList.map((subMenu) => ({
			menuTopId: String(topMenu.menuTopId),
			menuSubId: String(subMenu.menuSubId),
		})),
	);
}

interface ProductListParams {
	params: {
		menuSubId: string;
		menuTopId: string;
	};
}
export default async function CategoryProductList({ params: { menuSubId, menuTopId } }: ProductListParams) {
	// [ISR] 현재 메뉴명을 가져오기 위한
	const menusResponse = await getCached<MenuResponse>(getBackendUrl(API_URL.MAIN_MENU));
	const menuList = [...menusResponse.menuList].sort((a, b) => a.menuTopId - b.menuTopId);
	// [ISR] 제품 리스트 조회
	const payload: GetProductListRequest = {
		sort: "POPULAR",
		popularPeriod: "ALL",
		menuSubId: Number(menuSubId),
		// lastCreatedAt,
		// lastProductId,
		// lastPopularity
	};

	const productResponse: GetProductListResponse = await getCached(getBackendUrl(API_URL.PRODUCT), { ...payload });

	// 현재 메뉴명 찾기
	const currentTopMenu = menuList.find((menu) => menu.menuTopId === Number(menuTopId));
	const currentSubMenu = currentTopMenu?.menuSubList.find((sub) => sub.menuSubId === Number(menuSubId));

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
