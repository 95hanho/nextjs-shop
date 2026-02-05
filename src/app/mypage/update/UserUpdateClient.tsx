/* 내 정보 수정 */
"use client";

import { AddressResult, AddressSection } from "@/components/auth/AddressSection";
import { FormInput } from "@/components/auth/FormInput";
import { InfoMark } from "@/components/auth/InfoMark";
import { useUserUpdateForm } from "@/hooks/query/auth/form/useUserUpdateForm";
import { useAuth } from "@/hooks/useAuth";
import { FormInputRef } from "@/types/form";

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
		authNumberView,
		clickCheckPhoneAuth,
	} = useUserUpdateForm();

	if (!user.name) return null;
	return (
		<main id="myPageInfo" className="user-info">
			<div id="userInfo" className="form-wrap update">
				<form onSubmit={userUpdateSubmit}>
					<h2>내 정보 수정</h2>
					<InfoMark title="아이디" infoVal={<span>{userIdData?.userId}</span>} />
					<AddressSection
						form={userUpdateForm}
						alarm={userUpdateAlarm}
						setAddress={(result: AddressResult) => {
							setUserUpdateForm((prev) => ({
								...prev,
								zonecode: result.zonecode,
								address: result.address,
							}));
						}}
						changeForm={changeUserUpdateForm}
						validateForm={validateUserUpdateForm}
						setFormRef={(el: FormInputRef) => (userUpdateFormInputRefs.current.addressDetail = el)}
					/>
					<FormInput
						name="phone"
						label="휴대폰"
						placeholder="휴대폰번호를 입력해주세요."
						type="tel"
						value={userUpdateForm.phone}
						alarm={userUpdateAlarm}
						onChange={changeUserUpdateForm}
						searchBtn={
							user.phone === userUpdateForm.phone
								? undefined
								: {
										txt: "인증",
										fnc: () => {
											clickPhoneAuth();
										},
									}
						}
						onBlur={validateUserUpdateForm}
						ref={(el) => {
							userUpdateFormInputRefs.current.phone = el;
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
							value={userUpdateForm.phoneAuth}
							alarm={userUpdateAlarm}
							onChange={changeUserUpdateForm}
							searchBtn={{
								txt: "확인",
								fnc: () => {
									clickCheckPhoneAuth();
								},
							}}
							onBlur={validateUserUpdateForm}
							ref={(el) => {
								userUpdateFormInputRefs.current.phone = el;
							}}
							inputMode="numeric"
							pattern="[0-9]*"
							maxLength={6}
						/>
					)}
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
					<div className="submit-wrap info">
						<input type="submit" className="" value={"완료"} />
					</div>
				</form>
			</div>
		</main>
	);
}
