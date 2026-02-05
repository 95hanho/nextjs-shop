/* 아이디, 비밀번호 찾기 클라 */
"use client";

import styles from "./FindUserClient.module.scss";
import { FormInput } from "@/components/auth/FormInput";
import { FormPageShell } from "@/components/auth/FormPageShell";
import { PhoneAuthSection } from "@/components/auth/PhoneAuthSection";
import { useFindUserForm } from "@/hooks/query/auth/form/useFindUserForm";
import Link from "next/link";

export default function FindUserClient() {
	const {
		findType,
		phoneAuthComplete,
		findUserSubmit,
		findUserForm,
		findUserFormAlarm,
		changeFindUserForm,
		validatefindUserForm,
		findUserFormInputRefs,
		clickPhoneAuth,
		phoneAuthView,
		clickCheckPhoneAuth,
		findId,
	} = useFindUserForm();

	if (!findType) return null;
	return (
		<FormPageShell
			title={
				<>
					{findType == "id" && "아이디"}
					{findType == "password" && "비밀번호"}찾기
				</>
			}
		>
			{!phoneAuthComplete ? (
				<form onSubmit={findUserSubmit}>
					{findType == "password" && (
						<FormInput
							name="userId"
							label="아이디"
							placeholder="아이디를 입력해주세요."
							value={findUserForm.userId}
							alarm={findUserFormAlarm}
							onChange={changeFindUserForm}
							onBlur={validatefindUserForm}
							ref={(el) => {
								findUserFormInputRefs.current.userId = el;
							}}
						/>
					)}
					<PhoneAuthSection
						form={findUserForm}
						alarm={findUserFormAlarm}
						changeForm={changeFindUserForm}
						validateForm={validatefindUserForm}
						setPhoneRef={(el) => {
							findUserFormInputRefs.current.phone = el;
						}}
						setPhoneAuthRef={(el) => {
							findUserFormInputRefs.current.phoneAuth = el;
						}}
						clickPhoneAuth={clickPhoneAuth}
						authNumberView={phoneAuthView}
						clickCheckPhoneAuth={clickCheckPhoneAuth}
					/>
				</form>
			) : (
				<div>
					{findType === "id" && (
						<div>
							<div>
								<p className="text-lg">
									<span>아이디 : </span>
									<span className="font-bold">{findId}</span>
								</p>
							</div>
							<div className={styles.findResultActions}>
								<Link className={styles.btnLogin} href={"/user"}>
									로그인
								</Link>
								<Link className={styles.btnPassword} href={"/user/find/password"}>
									비밀번호 찾기
								</Link>
							</div>
						</div>
					)}
				</div>
			)}
		</FormPageShell>
	);
}
