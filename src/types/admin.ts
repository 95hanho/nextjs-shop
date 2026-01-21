import { BaseResponse } from "@/types/common";
import { JwtPayload } from "jsonwebtoken";

// 로그인폼 데이터
export type AdminLoginForm = {
	adminId: string;
	password: string;
};
// 로그인 토큰 구조
export type AdminToken = {
	type: "ADMIN";
	adminNo: number;
} & JwtPayload;

export type AdminInfo = {
	adminName: string;
	lastLoginAt: string;
};
/* ------------------------------------------------------------- */

/* ---------- 관리자정보 조회 ---------*/
export interface AdminResponse extends BaseResponse {
	admin: AdminInfo;
}
/* 로그인 */
export interface AdminLoginResponse extends BaseResponse {
	adminNo: number;
}
