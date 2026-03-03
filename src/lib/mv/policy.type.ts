import { Token } from "@/types/token";

export type AuthScope = "user" | "seller" | "admin";

export type CookieKeyPair = {
	access: string;
	refresh: string;
};

export type MiddlewarePolicy = {
	scope: AuthScope;
	cookies: CookieKeyPair;
	verifyAccessToken: (token: string) => Promise<Token>;

	// refresh API (역할별로 다를 수 있음)
	refreshEndpoint: string;

	// 로그인 URL 만들기 (returnUrl 규칙이 role별로 다를 수 있음)
	buildLoginUrl: (pathname: string, search: string, message: string) => string;

	// 인증이 필요한 path 판별 (role별로 다를 수 있음)
	isAuthRequiredPath: (pathname: string) => boolean;
};
