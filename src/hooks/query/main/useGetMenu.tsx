import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import { Menu, MenuResponse } from "@/types/main";
import { useQuery } from "@tanstack/react-query";

// 메뉴 카테고리 조회
export function useGetMenu() {
	return useQuery<MenuResponse, Error, Menu[]>({
		queryKey: ["mainMenu"],
		queryFn: () => getNormal<MenuResponse>(getApiUrl(API_URL.MAIN_MENU)),
		select: (data) => data.menuList,
	});
}
