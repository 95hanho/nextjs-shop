import type { StringValue } from "ms";

// TOKEN_EXPIRES : 토큰 유지시간
// TOKEN_COOKIE : 토큰 저장할 쿠키 유지시간
// -------------------------------------------------------------
export const ACCESS_TOKEN_EXPIRES_IN = "10d"; // 10일
export const ACCESS_TOKEN_COOKIE_AGE = 60 * 60 * 24 * 10; // 10일
// export const ACCESS_TOKEN_EXPIRES_IN: StringValue = "5s"; // 5초
// export const ACCESS_TOKEN_COOKIE_AGE: number = 5; // 5초
export const REFRESH_TOKEN_EXPIRES_IN: StringValue = "30d"; // 30일
export const REFRESH_TOKEN_COOKIE_AGE: number = 60 * 60 * 24 * 30; // 30일
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
export const SELLER_TOKEN_EXPIRES_IN: StringValue = "5y"; // 5년
export const SELLER_TOKEN_COOKIE_AGE: number = 60 * 60 * 24 * 365 * 5; // 5년
// -------------------------------------------------------------
export const ADMIN_TOKEN_EXPIRES_IN: StringValue = "5y"; // 5년
export const ADMIN_TOKEN_COOKIE_AGE: number = 60 * 60 * 24 * 365 * 5; // 5년
