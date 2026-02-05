/* BEGIN : COMMON */
export type FormInputAlarm<T> = {
	name: T;
	message: string;
	status?: "SUCCESS" | "FAIL";
} | null;
export type FormInputRef = HTMLInputElement | null;
export type FormInputRefs<T extends string> = {
	[K in T]: FormInputRef;
};
export type SetFormRef = (el: FormInputRef) => void;

/* END : COMMON */
