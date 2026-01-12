import type { StringValue } from "ms";

// TOKEN_EXPIRES : 토큰 유지시간
// TOKEN_COOKIE : 토큰 저장할 쿠키 유지시간
// -------------------------------------------------------------
// export const ACCESS_TOKEN_EXPIRES_IN = "10m"; // 10분
// export const ACCESS_TOKEN_COOKIE_AGE = 600; // 10분
export const ACCESS_TOKEN_EXPIRES_IN: StringValue = "5s"; // 5초
export const ACCESS_TOKEN_COOKIE_AGE: number = 5; // 5초
export const REFRESH_TOKEN_EXPIRES_IN: StringValue = "3d"; // 3일
export const REFRESH_TOKEN_COOKIE_AGE: number = 60 * 60 * 24 * 3; // 3일
// export const REFRESH_TOKEN_EXPIRES_IN = "30m"; // 30분
// export const REFRESH_TOKEN_COOKIE_AGE = 1800; // 30분
// export const REFRESH_TOKEN_EXPIRES_IN = "15s"; // 15초
// export const REFRESH_TOKEN_COOKIE_AGE = 15; // 15초
// -------------------------------------------------------------
export const PHONE_AUTH_EXPIRES_IN: StringValue = "3m";
export const PHONE_AUTH_COMPLETE_EXPIRES_IN: StringValue = "30m";
export const PHONE_AUTH_COMPLETE_COOKIE_AGE: number = 60 * 30; // 30분
export const PWD_CHANGE_EXPIRES_IN: StringValue = "5m";
export const PWD_CHANGE_COOKIE_AGE: number = 60 * 5; // 5분
// -------------------------------------------------------------
export const SELLER_TOKEN_EXPIRES_IN: StringValue = "5s"; // 5초
export const SELLER_TOKEN_COOKIE_AGE: number = 5; // 5초
