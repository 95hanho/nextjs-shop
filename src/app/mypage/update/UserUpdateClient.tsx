/* 내 정보 수정 */
"use client";

import { AddressSection } from "@/components/auth/AddressSection";
import { FormActionButton } from "@/components/form/FormActionButton";
import { FormInput } from "@/components/form/FormInput";
import { FormPageShell } from "@/components/form/FormPageShell";
import { InfoMark } from "@/components/form/InfoMark";
import { PhoneAuthSection } from "@/components/auth/PhoneAuthSection";
import { useUserUpdateForm } from "@/hooks/query/auth/form/useUserUpdateForm";
import { useAuth } from "@/hooks/useAuth";

export default function UserInfoUpdate() {
	// 1) [store / custom hooks] -------------------------------------------
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
						handleKakaoAddress={(result) => {
							setUserUpdateForm((prev) => ({
								...prev,
								zonecode: result.zonecode,
								address: result.address,
							}));
						}}
						changeForm={changeUserUpdateForm}
						validateForm={validateUserUpdateForm}
						refs={{
							address(el) {
								userUpdateFormInputRefs.current.address = el;
							},
							addressDetail(el) {
								userUpdateFormInputRefs.current.addressDetail = el;
							},
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
					<FormActionButton title="완료" type="info" />
				</div>
			</form>
		</FormPageShell>
	);
}
