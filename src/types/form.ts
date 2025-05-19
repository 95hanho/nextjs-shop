export type FormEvent = React.FormEvent<HTMLFormElement>;
export type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

export interface LoginData {
	user_id: string;
	password: string;
}

export interface JoinForm extends LoginData {
	password_check: string;
	name: string;
	zonecode: string;
	address: string;
	address_detail: string;
	birthday: string;
	phone: string;
	email: string;
	// [key: string]: string;
}

export type JoinFormAlert = Omit<JoinForm, 'zonecode'>

/* ------------------------------------------------ */

export interface JoinFormRefs {
	user_id: HTMLInputElement | null;
	password: HTMLInputElement | null;
	password_check: HTMLInputElement | null;
	name: HTMLInputElement | null;
	address: HTMLInputElement | null;
	address_detail: HTMLInputElement | null;
	phone: HTMLInputElement | null;
	email: HTMLInputElement | null;
	birthday: HTMLInputElement | null;
	[key: string]: HTMLInputElement | null | undefined;
}

export interface JoinFormFocus {
	user_id: boolean;
	password: boolean;
	password_check: boolean;
	name: boolean;
	address: boolean;
	address_detail: HTMLInputElement | null;
	phone1: boolean;
	phone2: boolean;
	phone3: boolean;
	mobile1: boolean;
	mobile2: boolean;
	mobile3: boolean;
	email: boolean;
	birthday: boolean;
}
