import { FormInput } from "@/components/auth/FormInput";
import { ChangeFunction } from "@/types/event";
import { FormInputAlarm, SetFormRef } from "@/types/form";

interface PhoneAuthSectionProps {
	form: {
		phone: string;
		phoneAuth: string;
	};
	alarm: FormInputAlarm<keyof PhoneAuthSectionProps["form"]>;
	changeForm: ChangeFunction;
	validateForm: ChangeFunction;
	setPhoneRef: SetFormRef;
	setPhoneAuthRef: SetFormRef;
	clickPhoneAuth: () => void;
	authNumberView: boolean;
	clickCheckPhoneAuth: () => void;
}

export const PhoneAuthSection = ({
	form,
	alarm,
	changeForm,
	validateForm,
	setPhoneRef,
	setPhoneAuthRef,
	clickPhoneAuth,
	authNumberView,
	clickCheckPhoneAuth,
}: PhoneAuthSectionProps) => {
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
				searchBtn={{
					txt: "인증",
					fnc: () => {
						clickPhoneAuth();
					},
				}}
				onBlur={validateForm}
				ref={(el) => {
					setPhoneRef(el);
				}}
				inputMode="numeric"
				pattern="[0-9]*"
				maxLength={11}
			/>
			{authNumberView && (
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
