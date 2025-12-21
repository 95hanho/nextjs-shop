import { JwtPayload } from "jsonwebtoken";
import { BaseResponse } from "./common";

export type FormEvent = React.FormEvent<HTMLFormElement>;
export type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

export type Token = {
	userId: string;
} & JwtPayload;

// 로그인폼 데이터
export type LoginForm = {
	userId: string;
	password: string;
};
// 로그인 응답
export interface loginResponse extends BaseResponse {
	accessToken: string;
	refreshToken: string;
}
// 회원가입폼 추가사항
export type joinFormAdd = {
	passwordCheck: string;
};
// 회원가입폼
export interface JoinForm extends LoginForm, joinFormAdd {
	name: string;
	zonecode: string;
	address: string;
	addressDetail: string;
	birthday: string;
	phone: string;
	phoneAuth: string;
	email: string;
	// [key: string]: string;
}
// 회원정보 추가사항
export type UserAdd = {
	createdAt: Date;
	mileage: number;
	tall: number;
	weight: number;
	withdrawalStatus: boolean;
};
// 유저
export type User = LoginForm & JoinForm & UserAdd;
// 회원정보 응답
export interface UserResponse extends BaseResponse {
	user: User;
}

export type JoinFormAlert = Omit<JoinForm, "zonecode">;

/* ------------------------------------------------ */

export interface JoinFormRefs {
	userId: HTMLInputElement | null;
	password: HTMLInputElement | null;
	passwordCheck: HTMLInputElement | null;
	name: HTMLInputElement | null;
	address: HTMLInputElement | null;
	addressDetail: HTMLInputElement | null;
	phone: HTMLInputElement | null;
	email: HTMLInputElement | null;
	birthday: HTMLInputElement | null;
	[key: string]: HTMLInputElement | null | undefined;
}
export interface JoinFormFocus {
	userId: boolean;
	password: boolean;
	passwordCheck: boolean;
	name: boolean;
	address: boolean;
	addressDetail: HTMLInputElement | null;
	phone1: boolean;
	phone2: boolean;
	phone3: boolean;
	mobile1: boolean;
	mobile2: boolean;
	mobile3: boolean;
	email: boolean;
	birthday: boolean;
}
/* ------------- */

export type UserInfo = {
	userId: string;
	name: string;
	zonecode: string;
	address: string;
	addressDetail: string;
	birthday: string;
	phone: string;
	email: string;
	createdAt: Date;
	mileage: number;
	tall: number;
	weight: number;
	withdrawalStatus: boolean;
};
