"use client";

import { AddressSection } from "@/components/auth/AddressSection";
import { FormActionButton } from "@/components/form/FormActionButton";
import { FormInput } from "@/components/form/FormInput";
import { FormPageShell } from "@/components/form/FormPageShell";
import { PhoneAuthSection } from "@/components/auth/PhoneAuthSection";
import Link from "next/link";
import { useSellerJoinForm } from "@/hooks/form/useSellerJoinForm";

export default function SellerJoinClient() {
	// 1) [store / custom hooks] -------------------------------------------
	const {
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
	} = useSellerJoinForm();

	return (
		<FormPageShell title={<Link href={"/"}>판매자 등록</Link>} formWidth={500}>
			<form onSubmit={joinSubmit}>
				<FormInput
					requiredMark
					name="sellerId"
					label="아이디"
					placeholder="아이디를 입력해주세요."
					value={joinForm.sellerId}
					alarm={joinAlarm}
					onChange={changeJoinForm}
					onBlur={validateJoinForm}
					ref={(el) => {
						joinFormInputRefs.current.sellerId = el;
					}}
				/>
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
					name="sellerName"
					label="판매자이름"
					placeholder="판매자이름을 입력해주세요."
					value={joinForm.sellerName}
					alarm={joinAlarm}
					onChange={changeJoinForm}
					onBlur={validateJoinForm}
					ref={(el) => {
						joinFormInputRefs.current.sellerName = el;
					}}
				/>
				<FormInput
					name="sellerNameEn"
					label="판매자이름(영문)"
					placeholder="판매자이름을 입력해주세요."
					value={joinForm.sellerNameEn}
					alarm={joinAlarm}
					onChange={changeJoinForm}
					onBlur={validateJoinForm}
					ref={(el) => {
						joinFormInputRefs.current.sellerNameEn = el;
					}}
				/>
				<FormInput
					name="extensionNumber"
					label="내선번호"
					placeholder="내선번호를 입력해주세요."
					value={joinForm.extensionNumber}
					alarm={joinAlarm}
					onChange={changeJoinForm}
					onBlur={validateJoinForm}
					ref={(el) => {
						joinFormInputRefs.current.extensionNumber = el;
					}}
				/>
				<PhoneAuthSection
					requiredMark
					nameSet={["mobileNumber", "phoneAuth"]}
					form={{
						phone: joinForm.mobileNumber,
						phoneAuth: joinForm.phoneAuth,
					}}
					alarm={joinAlarm}
					changeForm={changeJoinForm}
					validateForm={validateJoinForm}
					setPhoneRef={(el) => {
						joinFormInputRefs.current.mobileNumber = el;
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
				<FormInput
					name="businessRegistrationNumber"
					label="사업자 등록번호"
					placeholder="사업자 등록번호를 입력해주세요."
					type="text"
					value={joinForm.businessRegistrationNumber}
					alarm={joinAlarm}
					onChange={changeJoinForm}
					onBlur={validateJoinForm}
					ref={(el) => {
						joinFormInputRefs.current.businessRegistrationNumber = el;
					}}
				/>
				<FormInput
					name="telecomSalesNumber"
					label="통신 판매자 번호"
					placeholder="통신 판매자 번호를 입력해주세요."
					type="text"
					value={joinForm.telecomSalesNumber}
					alarm={joinAlarm}
					onChange={changeJoinForm}
					onBlur={validateJoinForm}
					ref={(el) => {
						joinFormInputRefs.current.telecomSalesNumber = el;
					}}
				/>
				<FormInput
					name="representativeName"
					label="대표자 이름"
					placeholder="대표자 이름을 입력해주세요."
					type="text"
					value={joinForm.representativeName}
					alarm={joinAlarm}
					onChange={changeJoinForm}
					onBlur={validateJoinForm}
					ref={(el) => {
						joinFormInputRefs.current.representativeName = el;
					}}
				/>
				<AddressSection
					form={{
						zonecode: joinForm.businessZipcode,
						address: joinForm.businessAddress,
						addressDetail: joinForm.businessAddressDetail,
					}}
					alarm={joinAlarm}
					handleKakaoAddress={(result) => {
						setJoinForm((prev) => ({
							...prev,
							businessZipcode: result.zonecode,
							businessAddress: result.address,
						}));
					}}
					changeForm={changeJoinForm}
					validateForm={validateJoinForm}
					refs={{
						address(el) {
							joinFormInputRefs.current.businessAddress = el;
						},
						addressDetail(el) {
							joinFormInputRefs.current.businessAddressDetail = el;
						},
					}}
					addressDetailName="businessAddressDetail"
				/>
				<div className="h-7"></div>

				<FormActionButton title="등록요청" />
			</form>
		</FormPageShell>
	);
}
