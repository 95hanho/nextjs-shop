/* 비밀번호바꾸기 클라 */
"use client";

import { AuthActionButton } from "@/components/auth/AuthActionButton";
import { FormInput } from "@/components/auth/FormInput";
import { FormPageShell } from "@/components/auth/FormPageShell";
import { usePasswordChangeForm } from "@/hooks/query/auth/form/usePasswordChangeForm";

interface PasswordChangeClientProps {
	mode: "LOGGED_IN" | "RESET";
}
//
export default function PasswordChangeClient({ mode }: PasswordChangeClientProps) {
	const { pwdChangeSubmit, pwdChangeForm, pwdChangeAlarm, changePwdChangeForm, validatePwdChangeForm, pwdChangeFormInputRefs } =
		usePasswordChangeForm({
			mode,
		});

	return (
		<FormPageShell title="비밀번호 변경" formWidth={400}>
			<form onSubmit={pwdChangeSubmit}>
				{mode === "LOGGED_IN" && (
					<FormInput
						name="curPassword"
						label="현재비밀번호"
						placeholder="현재 비밀번호를 입력해주세요."
						type="password"
						value={pwdChangeForm.curPassword}
						alarm={pwdChangeAlarm}
						onChange={changePwdChangeForm}
						onBlur={validatePwdChangeForm}
						ref={(el) => {
							pwdChangeFormInputRefs.current.curPassword = el;
						}}
						inputWidthFill={true}
					/>
				)}
				<FormInput
					name="newPassword"
					label="새로운 비밀번호"
					type="password"
					placeholder="새로운 비밀번호를 입력해주세요."
					value={pwdChangeForm.newPassword}
					alarm={pwdChangeAlarm}
					onChange={changePwdChangeForm}
					onBlur={validatePwdChangeForm}
					ref={(el) => {
						pwdChangeFormInputRefs.current.newPassword = el;
					}}
					inputWidthFill={true}
				/>
				<FormInput
					name="newPasswordCheck"
					label="비밀번호 확인"
					placeholder="비밀번호를 다시 입력해주세요."
					type="password"
					value={pwdChangeForm.newPasswordCheck}
					alarm={pwdChangeAlarm}
					onChange={changePwdChangeForm}
					onBlur={validatePwdChangeForm}
					ref={(el) => {
						pwdChangeFormInputRefs.current.newPasswordCheck = el;
					}}
					inputWidthFill={true}
				/>
				<AuthActionButton title="완료" type="info" />
			</form>
		</FormPageShell>
	);
}
