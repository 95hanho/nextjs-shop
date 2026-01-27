import { BaseResponse } from "./common";

export type User = {
	name: string;
	zonecode: string;
	address: string;
	addressDetail: string;
	birthday: string;
	phone: string;
	email: string;
	// createdAt: string;
	// updatedAt: string;
	// withdrawalStatus: "ACTIVE" | "REQUESTED" | "WITHDRAWN"; //
	// withdrawalRequestedAt: string;
	// withdrawalCompletedAt: string;
};

// 회원정보 추가사항
export type UserAdd = {
	createdAt: Date;
	mileage: number;
	tall: number;
	weight: number;
};

/* ---- FE --------------------------------------------- */

/* 로그인 */
export type LoginFormData = {
	userId: string;
	password: string;
};
/* 회원가입 */
export interface JoinForm extends LoginFormData, User {
	phoneAuth: string;
	passwordCheck: string;
}

/* ---- API --------------------------------------------- */

/* 회원정보가져오기 */
export type UserInfo = User & UserAdd;
export interface GetUserResponse extends BaseResponse {
	user: UserInfo;
}
export interface PhoneAuthCheckRequest {
	authNumber: string;
	phoneAuthToken: string;
	userId?: string;
}
/*  */
export interface UserUpdateResponse {
	message: string;
	email: string;
	phone: string;
}
