"use client";

import { AddressSection } from "@/components/auth/AddressSection";
import { FormActionButton } from "@/components/form/FormActionButton";
import { FormInput } from "@/components/form/FormInput";
import { FormPageShell } from "@/components/form/FormPageShell";
import { PhoneAuthSection } from "@/components/auth/PhoneAuthSection";
import { useUserJoinForm } from "@/hooks/form/useUserJoinForm";

/* 회원가입 */
export default function UserJoinClient() {
	// 1) [store / custom hooks] -------------------------------------------
	const {
		joinDisabled,
		joinSubmit,
		joinForm,
		setJoinForm,
		joinAlarm,
		joinFormInputRefs,
		changeJoinForm,
		validateJoinForm,
		clickPhoneAuth,
		phoneAuthView,
		clickCheckPhoneAuth,
	} = useUserJoinForm();

	return (
		<FormPageShell title={"회원가입"} formWidth={500}>
			<form onSubmit={joinSubmit}>
				<FormInput
					requiredMark
					name="userId"
					label="아이디"
					placeholder="아이디를 입력해주세요."
					value={joinForm.userId}
					alarm={joinAlarm}
					onChange={changeJoinForm}
					onBlur={validateJoinForm}
					ref={(el) => {
						joinFormInputRefs.current.userId = el;
					}}
				/>
				{/* {pwdFocus && loginForm.password && (
					<button className={styles.showPwd} type="button" onClick={() => setShowPassword(!showPassword)}>
						{showPassword ? <FiEyeOff /> : <FiEye />}
					</button>
				)} */}
				<FormInput
					requiredMark
					name="password"
					label="비밀번호"
					placeholder="비밀번호를 입력해주세요."
					type="password"
					value={joinForm.password}
					alarm={joinAlarm}
					onChange={changeJoinForm}
					onBlur={validateJoinForm}
					ref={(el) => {
						joinFormInputRefs.current.password = el;
					}}
				/>
				<FormInput
					requiredMark
					name="passwordCheck"
					label="비밀번호 확인"
					placeholder="비밀번호를 한 번 더 입력해주세요."
					type="password"
					value={joinForm.passwordCheck}
					alarm={joinAlarm}
					onChange={changeJoinForm}
					onBlur={validateJoinForm}
					ref={(el) => {
						joinFormInputRefs.current.passwordCheck = el;
					}}
				/>
				<div className="h-7"></div>
				<FormInput
					requiredMark
					name="name"
					label="이름"
					placeholder="이름을 입력해주세요."
					value={joinForm.name}
					alarm={joinAlarm}
					onChange={changeJoinForm}
					onBlur={validateJoinForm}
					ref={(el) => {
						joinFormInputRefs.current.name = el;
					}}
				/>
				<AddressSection
					requiredMark
					form={joinForm}
					alarm={joinAlarm}
					handleKakaoAddress={(result) => {
						setJoinForm((prev) => ({
							...prev,
							zonecode: result.zonecode,
							address: result.address,
						}));
					}}
					changeForm={changeJoinForm}
					validateForm={validateJoinForm}
					refs={{
						address(el) {
							joinFormInputRefs.current.address = el;
						},
						addressDetail(el) {
							joinFormInputRefs.current.addressDetail = el;
						},
					}}
				/>
				<FormInput
					requiredMark
					name="birthday"
					label="생년월일"
					placeholder="YYYY/MM/DD"
					value={joinForm.birthday}
					alarm={joinAlarm}
					onChange={changeJoinForm}
					onBlur={validateJoinForm}
					ref={(el) => {
						joinFormInputRefs.current.birthday = el;
					}}
				/>
				<div className="h-7"></div>
				<PhoneAuthSection
					requiredMark
					form={joinForm}
					alarm={joinAlarm}
					changeForm={changeJoinForm}
					validateForm={validateJoinForm}
					setPhoneRef={(el) => {
						joinFormInputRefs.current.phone = el;
					}}
					setPhoneAuthRef={(el) => {
						joinFormInputRefs.current.phoneAuth = el;
					}}
					clickPhoneAuth={clickPhoneAuth}
					phoneAuthView={phoneAuthView}
					clickCheckPhoneAuth={clickCheckPhoneAuth}
				/>
				<FormInput
					requiredMark
					name="email"
					label="이메일"
					placeholder="이메일을 입력해주세요."
					type="text"
					value={joinForm.email}
					alarm={joinAlarm}
					onChange={changeJoinForm}
					onBlur={validateJoinForm}
					ref={(el) => {
						joinFormInputRefs.current.email = el;
					}}
				/>
				<FormActionButton title="회원가입" disabled={joinDisabled} />
			</form>
		</FormPageShell>
	);
}
