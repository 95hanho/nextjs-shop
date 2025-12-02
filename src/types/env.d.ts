declare namespace NodeJS {
	interface ProcessEnv {
		NEXT_PUBLIC_BASIC_IMAGE: string;
		NEXT_PUBLIC_BASE_URL: string | "";
		NEXT_PUBLIC_SERVER_URL: string;
		NEXT_PUBLIC_JWT_SECRET: string;
		NEXT_PUBLIC_COOKIE_SECURE: string;
		// 필요한 것들 추가
	}
}
