export type FormEvent = React.FormEvent<HTMLFormElement>;
export type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

export interface LoginData {
	id: string;
	password: string;
}

export interface JoinForm extends LoginData {
	password_check: string;
	name: string;
	zonecode: string;
	address: string;
	birthday: string;
	phone: string;
	email: string;
	[key: string]: string;
}

/* ------------------------------------------------ */

export interface JoinFormRefs {
	id: HTMLInputElement | null;
	password: HTMLInputElement | null;
	password_check: HTMLInputElement | null;
	name: HTMLInputElement | null;
	zonecode: HTMLInputElement | null;
	address: HTMLInputElement | null;
	phone: HTMLInputElement | null;
	email: HTMLInputElement | null;
	birthday: HTMLInputElement | null;
	[key: string]: HTMLInputElement | null | undefined;
}

export interface JoinFormFocus {
	id: boolean;
	password: boolean;
	password_check: boolean;
	name: boolean;
	zonecode: boolean;
	address: boolean;
	phone1: boolean;
	phone2: boolean;
	phone3: boolean;
	mobile1: boolean;
	mobile2: boolean;
	mobile3: boolean;
	email: boolean;
	birthday: boolean;
}
