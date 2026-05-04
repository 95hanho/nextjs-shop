declare namespace NodeJS {
	interface ProcessEnv {
		NEXT_PUBLIC_BASIC_IMAGE: string;
		NEXT_PUBLIC_BASE_URL: string | "";
		SERVER_URL: string;
		JWT_SECRET: string;
		COOKIE_SECURE: string;
		// 필요한 것들 추가
	}
}
