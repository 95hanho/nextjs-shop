import { JwtPayload } from "jsonwebtoken";
import { BaseResponse } from "./common";

export type FormEvent = React.FormEvent<HTMLFormElement>;
export type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

export type Token = {
	id?: string;
} & JwtPayload;

// 로그인 데이터
export type LoginForm = {
	userId: string;
	password: string;
};
//
export interface loginResponse extends BaseResponse {
	accessToken: string;
	refreshToken: string;
}
//
export interface JoinForm extends LoginForm {
	passwordCheck: string;
	name: string;
	zonecode: string;
	address: string;
	addressDetail: string;
	birthday: string;
	phone: string;
	email: string;
	// [key: string]: string;
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
