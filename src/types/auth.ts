import { BaseResponse } from "./common";

/* MODEL --------------------------------------------- */

export type User = {
	name: string;
	zonecode: string;
	address: string;
	addressDetail: string;
	birthday: string;
	phone: string;
	email: string;
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
export type LoginFormData<T extends string = "userId"> = {
	[key in T]: string;
} & {
	password: string;
};

/* ---- API --------------------------------------------- */

/* 회원정보가져오기 */
export type UserInfo = User & UserAdd;
export interface GetUserResponse extends BaseResponse {
	user: UserInfo;
}
/* 휴대폰 인증 */
export interface PhoneAuthRequest {
	phone: string;
	mode: "JOIN" | "IDFIND" | "PWDFIND" | "CHANGE";
	phoneAuthToken?: string;
}
/* 휴대폰 인증 확인 */
export interface PhoneAuthCheckRequest {
	authNumber: string;
	phoneAuthToken: string;
}
export type PhoneAuthCheckResponse =
	| {
			message: "PHONEAUTH_VALIDATE";
	  }
	| {
			message: "IDFIND_SUCCESS";
			userId: string;
	  }
	| {
			message: "PWDFIND_SUCCESS";
			userNo: number;
	  };
/* 회원가입 */
export interface JoinRequest extends LoginFormData, User {}
/* 회원정보변경 */
export interface UserUpdateRequest {
	zonecode: string;
	address: string;
	addressDetail: string;
	phone: string;
	changePhone?: boolean;
	email: string;
}
/* 비밀번호 변경 */
export interface PasswordChangeRequest {
	curPassword?: string;
	newPassword: string;
	pwdResetToken: string;
}
