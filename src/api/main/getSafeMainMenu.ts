import API_URL from "@/api/endpoints";
import { getCached } from "@/api/fetchFilter";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { MenuResponse } from "@/types/main";
import { cache } from "react";

const EMPTY_MENU_RESPONSE: MenuResponse = {
	menuList: [],
	message: "Failed to fetch main menu data. Returning empty menu list.",
};

export const getSafeMainMenu = cache(async () => {
	try {
		return await getCached<MenuResponse>(getBackendUrl(API_URL.MAIN_MENU));
	} catch (error) {
		console.error("[SSG] main menu fetch failed", error);
		return EMPTY_MENU_RESPONSE;
	}
});
