import { MiddlewarePolicy } from "@/lib/mv/policy.type";
import { verifyAccessTokenForMiddleware } from "@/lib/auth/utils/token";

export const userPolicy: MiddlewarePolicy = {
	scope: "user",
	cookies: {
		access: "accessToken",
		refresh: "refreshToken",
	},
	verifyAccessToken: verifyAccessTokenForMiddleware,

	refreshEndpoint: "/api/auth/refresh",
	buildLoginUrl: (pathname, search, message) => {
		const returnUrl = encodeURIComponent(pathname + search);
		return `/user?message=${message}&returnUrl=${returnUrl}`;
	},
	isAuthRequiredPath: (pathname) => {
		return false;
	},
};
