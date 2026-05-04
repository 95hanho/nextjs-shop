export const SERVER_URL = process.env.SERVER_URL ?? "";
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
