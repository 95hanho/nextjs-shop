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
}

/* ------------------------------------------------ */

export interface JoinFormRefs {
	id: HTMLInputElement | null;
	password: HTMLInputElement | null;
	password_check: HTMLInputElement | null;
	name: HTMLInputElement | null;
	zonecode: HTMLInputElement | null;
	address: HTMLInputElement | null;
	phone1: HTMLInputElement | null;
	phone2: HTMLInputElement | null;
	phone3: HTMLInputElement | null;
	mobile1: HTMLInputElement | null;
	mobile2: HTMLInputElement | null;
	mobile3: HTMLInputElement | null;
	email: HTMLInputElement | null;
	birthday: HTMLInputElement | null;
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
