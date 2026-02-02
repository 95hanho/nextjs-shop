"use client";

import { AddressSection } from "@/components/auth/AddressSection";
import { FormInput } from "@/components/auth/FormInput";
import { FormPageShell } from "@/components/auth/FormPageShell";
import { PhoneAuthSection } from "@/components/auth/PhoneAuthSection";
import { useUserJoinForm } from "@/hooks/query/auth/useUserJoinForm";
import Link from "next/link";

/* 회원가입 */
export default function UserJoinClient() {
	const {
		joinSubmit,
		joinForm,
		setJoinForm,
		joinAlarm,
		joinFormRefs,
		changeJoinForm,
		validateJoinForm,
		clickPhoneAuth,
		authNumberView,
		clickCheckPhoneAuth,
	} = useUserJoinForm();

	return (
		<FormPageShell title={<Link href={"/"}>NextJS-SHOP</Link>} formWidth={500}>
			<form onSubmit={joinSubmit}>
				<FormInput
					name="userId"
					label="아이디"
					placeholder="아이디를 입력해주세요."
					value={joinForm.userId}
					alarm={joinAlarm}
					onChange={changeJoinForm}
					onBlur={validateJoinForm}
					ref={(el) => {
						joinFormRefs.current.userId = el;
					}}
				/>
				<FormInput
					name="password"
					label="비밀번호"
					placeholder="비밀번호를 입력해주세요."
					type="password"
					value={joinForm.password}
					alarm={joinAlarm}
					onChange={changeJoinForm}
					onBlur={validateJoinForm}
					ref={(el) => {
						joinFormRefs.current.password = el;
					}}
				/>
				<FormInput
					name="passwordCheck"
					label="비밀번호 확인"
					placeholder="비밀번호를 한 번 더 입력해주세요."
					type="password"
					value={joinForm.passwordCheck}
					alarm={joinAlarm}
					onChange={changeJoinForm}
					onBlur={validateJoinForm}
					ref={(el) => {
						joinFormRefs.current.passwordCheck = el;
					}}
				/>
				<div className="join-space"></div>
				<FormInput
					name="name"
					label="이름"
					placeholder="이름을 입력해주세요."
					value={joinForm.name}
					alarm={joinAlarm}
					onChange={changeJoinForm}
					onBlur={validateJoinForm}
					ref={(el) => {
						joinFormRefs.current.name = el;
					}}
				/>
				<AddressSection
					form={joinForm}
					alarm={joinAlarm}
					setAddress={(result) => {
						setJoinForm((prev) => ({
							...prev,
							zonecode: result.zonecode,
							address: result.address,
						}));
					}}
					changeForm={changeJoinForm}
					validateForm={validateJoinForm}
					setFormRef={(el) => (joinFormRefs.current.addressDetail = el)}
				/>
				<FormInput
					name="birthday"
					label="생년월일"
					placeholder="YYYY/MM/DD"
					value={joinForm.birthday}
					alarm={joinAlarm}
					onChange={changeJoinForm}
					onBlur={validateJoinForm}
					ref={(el) => {
						joinFormRefs.current.birthday = el;
					}}
				/>
				<div className="join-space"></div>
				<PhoneAuthSection
					form={joinForm}
					alarm={joinAlarm}
					changeForm={changeJoinForm}
					validateForm={validateJoinForm}
					setPhoneRef={(el) => {
						joinFormRefs.current.phone = el;
					}}
					setPhoneAuthRef={(el) => {
						joinFormRefs.current.phoneAuth = el;
					}}
					clickPhoneAuth={clickPhoneAuth}
					authNumberView={authNumberView}
					clickCheckPhoneAuth={clickCheckPhoneAuth}
				/>

				<FormInput
					name="email"
					label="이메일"
					placeholder="이메일을 입력해주세요."
					type="text"
					value={joinForm.email}
					alarm={joinAlarm}
					onChange={changeJoinForm}
					onBlur={validateJoinForm}
					ref={(el) => {
						joinFormRefs.current.email = el;
					}}
				/>
				<div className="submit-wrap">
					<input type="submit" value={"회원가입"} />
				</div>
			</form>
		</FormPageShell>
	);
}
