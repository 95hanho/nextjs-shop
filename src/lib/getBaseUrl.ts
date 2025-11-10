export const getBaseUrl = () => {
	if (typeof window !== "undefined") {
		// 클라이언트일 경우 상대 경로면 충분
		return "/api";
	}
	// 서버일 경우 (production 환경 고려)
	return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/api";
};
//
export const getServerUrl = () => {
	// 서버일 경우 (production 환경 고려)
	return process.env.SERVER_URL + "/bapi";
};
