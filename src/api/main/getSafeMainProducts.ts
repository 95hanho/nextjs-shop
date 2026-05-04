import API_URL from "@/api/endpoints";
import { getCached } from "@/api/fetchFilter";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { MainProductResponse } from "@/types/main";

const EMPTY_MAIN_RESPONSE: MainProductResponse = {
	productList: [],
	// 실제 타입에 맞춰 필요한 기본값 추가
	message: "Failed to fetch main product data. Returning empty product list.",
};

export async function getSafeMainProducts(): Promise<MainProductResponse> {
	try {
		return await getCached<MainProductResponse>(getBackendUrl(API_URL.MAIN));
	} catch (error) {
		console.error("[SSG] main product fetch failed", error);
		return EMPTY_MAIN_RESPONSE;
	}
}
