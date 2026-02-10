export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? ""; // BFF만 쓰면 ''로 둬도 OK
export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "";
// 실서버 환경인지
export const isProd = process.env.NODE_ENV === "production";
// 사진없음 이미지
export const BASIC_NO_IMAGE = process.env.NEXT_PUBLIC_BASIC_NO_IMAGE || "";
/* JWT 인증키 */
export const REFRESH_JWT_SECRET_KEY = process.env.NEXT_PUBLIC_REFRESH_SECRET || "your-secret";
export const JWT_SECRET_KEY = process.env.NEXT_PUBLIC_JWT_SECRET || "your-secret";
export const MIDDLEWARE_JWT_SECRET_KEY = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
export const PHONE_AUTH_KEY = process.env.NEXT_PUBLIC_PHONE_AUTH || "your-secret";
export const PHONE_AUTH_COMPLETE_KEY = process.env.NEXT_PUBLIC_PHONE_AUTH_COMPLETE || "your-secret";
export const PWD_CHANGE_KEY = process.env.NEXT_PUBLIC_PWD_CHANGE || "your-secret";
export const SELLER_JWT_SECRET_KEY = process.env.NEXT_PUBLIC_SELLER_JWT_SECRET || "your-secret";
export const ADMIN_JWT_SECRET_KEY = process.env.NEXT_PUBLIC_ADMIN_JWT_SECRET || "your-secret";
// API 404에러 공통 메시지
export const WRONG_REQUEST_MESSAGE = process.env.NEXT_PUBLIC_WRONG_REQUEST_MESSAGE || "wrong-message";
// 마일리지 적립률
export const MILEAGE_RATE = isNaN(Number(process.env.NEXT_PUBLIC_WRONG_REQUEST_MESSAGE)) ? 0.01 : Number(process.env.NEXT_PUBLIC_MILEAGE_RATE);
