import { FormInput } from "@/components/auth/FormInput";
import { ChangeFunction } from "@/types/event";
import { FormInputAlarm, SetFormRef } from "@/types/form";

export type PhoneAuthResult = { zonecode: string; address: string };

type PhoneAuthForm = {
	phone: string;
	phoneAuth: string;
};

interface PhoneAuthSectionProps<K extends string> {
	form: PhoneAuthForm;
	alarm: FormInputAlarm<K>;
	changeForm: ChangeFunction;
	validateForm: ChangeFunction;
	setPhoneRef: SetFormRef;
	setPhoneAuthRef: SetFormRef;
	clickPhoneAuth: () => void;
	searchBtnHide?: boolean;
	phoneAuthView: boolean;
	clickCheckPhoneAuth: () => void;
}

export const PhoneAuthSection = <K extends string>({
	form,
	alarm,
	changeForm,
	validateForm,
	setPhoneRef,
	setPhoneAuthRef,
	clickPhoneAuth,
	searchBtnHide = false,
	phoneAuthView,
	clickCheckPhoneAuth,
}: PhoneAuthSectionProps<K>) => {
	return (
		<>
			<FormInput
				name="phone"
				label="휴대폰"
				placeholder="휴대폰번호를 입력해주세요."
				type="tel"
				value={form.phone}
				alarm={alarm}
				onChange={changeForm}
				searchBtn={
					searchBtnHide
						? undefined
						: {
								txt: "인증",
								fnc: () => {
									clickPhoneAuth();
								},
							}
				}
				onBlur={validateForm}
				ref={(el) => {
					setPhoneRef(el);
				}}
				inputMode="numeric"
				pattern="[0-9]*"
				maxLength={11}
			/>
			{phoneAuthView && (
				<FormInput
					name="phoneAuth"
					label="인증번호"
					placeholder="인증번호를 입력해주세요."
					value={form.phoneAuth}
					alarm={alarm}
					onChange={changeForm}
					searchBtn={{
						txt: "확인",
						fnc: () => {
							clickCheckPhoneAuth();
						},
					}}
					onBlur={validateForm}
					ref={(el) => {
						setPhoneAuthRef(el);
					}}
					inputMode="numeric"
					pattern="[0-9]*"
					maxLength={6}
				/>
			)}
		</>
	);
};
