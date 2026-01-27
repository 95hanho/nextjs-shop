import { BASE_URL, SERVER_URL } from "@/lib/env";

export const getApiUrl = (apiUrl: string) => {
	if (typeof window !== "undefined") {
		// 클라이언트일 경우 상대 경로면 충분
		return "/api" + apiUrl;
	}
	// 서버일 경우 (production 환경 고려)
	return (BASE_URL || "http://localhost:3000/api") + apiUrl;
};
//
export const getBackendUrl = (apiUrl: string) => {
	// 서버일 경우 (production 환경 고려)
	return SERVER_URL + "/bapi" + apiUrl;
};
