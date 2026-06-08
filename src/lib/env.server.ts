export const SERVER_URL = process.env.SERVER_URL ?? "";

const parseEnvBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
	if (value === undefined || value.trim() === "") return defaultValue;
	const normalized = value.trim().toLowerCase();
	return normalized === "true" || normalized === "1" || normalized === "on" || normalized === "yes";
};

/** middleware에서 accessToken 재발급 처리 여부 (기본: false) */
export const MIDDLEWARE_TOKEN_REFRESH_ENABLED = parseEnvBoolean(process.env.MIDDLEWARE_TOKEN_REFRESH_ENABLED, false);

/** middleware → Node 내부 refresh API 호출 시 사용하는 시크릿 (미설정 시 JWT_SECRET 사용) */
export const INTERNAL_REFRESH_SECRET = process.env.INTERNAL_REFRESH_SECRET ?? process.env.JWT_SECRET ?? "";
// =========================================
// JWT 인증키
// =========================================
// access
export const JWT_SECRET_KEY = process.env.JWT_SECRET!;
export const MIDDLEWARE_JWT_SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET!);
// refresh
export const REFRESH_JWT_SECRET_KEY = process.env.REFRESH_SECRET!;
export const MIDDLEWARE_REFRESH_JWT_SECRET_KEY = new TextEncoder().encode(process.env.REFRESH_SECRET!);
// seller, admin
export const SELLER_JWT_SECRET_KEY = process.env.SELLER_JWT_SECRET!;
export const MIDDLEWARE_SELLER_JWT_SECRET_KEY = new TextEncoder().encode(process.env.SELLER_JWT_SECRET!);
export const ADMIN_JWT_SECRET_KEY = process.env.ADMIN_JWT_SECRET!;
export const MIDDLEWARE_ADMIN_JWT_SECRET_KEY = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
// 전화인증, 비밀번호 변경 등 기타 JWT
export const PHONE_AUTH_KEY = process.env.PHONE_AUTH!;
export const PHONE_AUTH_COMPLETE_KEY = process.env.PHONE_AUTH_COMPLETE!;
export const PWD_CHANGE_KEY = process.env.PWD_CHANGE!;
// =========================================
// 기타
// =========================================
/** API 404에러 공통 메시지 */
export const WRONG_REQUEST_MESSAGE = process.env.WRONG_REQUEST_MESSAGE || "wrong-message";
