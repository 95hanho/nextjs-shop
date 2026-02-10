/* 내 정보 수정 */
"use client";

import { AddressSection } from "@/components/auth/AddressSection";
import { AuthActionButton } from "@/components/auth/AuthActionButton";
import { FormInput } from "@/components/auth/FormInput";
import { FormPageShell } from "@/components/auth/FormPageShell";
import { InfoMark } from "@/components/auth/InfoMark";
import { PhoneAuthSection } from "@/components/auth/PhoneAuthSection";
import { useUserUpdateForm } from "@/hooks/query/auth/form/useUserUpdateForm";
import { useAuth } from "@/hooks/useAuth";

export default function UserInfoUpdate() {
	const { user } = useAuth();
	const {
		userUpdateSubmit,
		userIdData,
		userUpdateForm,
		setUserUpdateForm,
		userUpdateAlarm,
		changeUserUpdateForm,
		clickPhoneAuth,
		validateUserUpdateForm,
		userUpdateFormInputRefs,
		phoneAuthView,
		clickCheckPhoneAuth,
	} = useUserUpdateForm();

	if (!user.name) return null;
	return (
		<FormPageShell title={"내 정보 수정"} formWidth={500} wrapMinHeight={100}>
			<form onSubmit={userUpdateSubmit}>
				<div>
					<InfoMark title="아이디" infoVal={<span>{userIdData?.userId}</span>} />
					<AddressSection
						form={userUpdateForm}
						alarm={userUpdateAlarm}
						setAddress={(result) => {
							setUserUpdateForm((prev) => ({
								...prev,
								zonecode: result.zonecode,
								address: result.address,
							}));
						}}
						changeForm={changeUserUpdateForm}
						validateForm={validateUserUpdateForm}
						setAddressRef={(el) => {
							userUpdateFormInputRefs.current.address = el;
						}}
						setAddressDetailRef={(el) => {
							userUpdateFormInputRefs.current.addressDetail = el;
						}}
					/>
					<PhoneAuthSection
						form={userUpdateForm}
						alarm={userUpdateAlarm}
						changeForm={changeUserUpdateForm}
						validateForm={validateUserUpdateForm}
						setPhoneRef={(el) => {
							userUpdateFormInputRefs.current.phone = el;
						}}
						setPhoneAuthRef={(el) => {
							userUpdateFormInputRefs.current.phone = el;
						}}
						clickPhoneAuth={clickPhoneAuth}
						searchBtnHide={user.phone === userUpdateForm.phone}
						phoneAuthView={phoneAuthView}
						clickCheckPhoneAuth={clickCheckPhoneAuth}
					/>
					<FormInput
						name="email"
						label="이메일"
						placeholder="이메일을 입력해주세요."
						type="text"
						value={userUpdateForm.email}
						alarm={userUpdateAlarm}
						onChange={changeUserUpdateForm}
						onBlur={validateUserUpdateForm}
						ref={(el) => {
							userUpdateFormInputRefs.current.email = el;
						}}
					/>
					<AuthActionButton title="완료" type="info" />
				</div>
			</form>
		</FormPageShell>
	);
}
