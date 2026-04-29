import { getNormal } from "@/api/fetchFilter";
import WishClient from "./WishClient";
import { MenuResponse } from "@/types/main";
import { getBackendUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";

// 위시 페이지
export default async function Wish() {
	// [SSR] 현재 메뉴명을 가져오기 위한
	const menusResponse = await getNormal<MenuResponse>(getBackendUrl(API_URL.MAIN_MENU));
	const menuList = [...menusResponse.menuList].sort((a, b) => a.menuTopId - b.menuTopId);

	return (
		<main id="wish">
			{/* <h1>위시에서 테스트중...</h1> */}
			<WishClient menuList={menuList} />
		</main>
	);
}
