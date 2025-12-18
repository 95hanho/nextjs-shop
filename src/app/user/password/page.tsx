/* 비밀번호 변경페이지 */
"use client";

import JoinInput from "@/components/user/JoinInput";
import { ChangeEvent, FormEvent } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type PasswordChangeForm = {
	curPassword: string;
	newPassword: string;
	newPasswordCheck: string;
};

type PasswordChangeFormRefs = {
	curPassword: HTMLInputElement | null;
	newPassword: HTMLInputElement | null;
	newPasswordCheck: HTMLInputElement | null;
};

const initPasswordChangeForm: PasswordChangeForm = {
	curPassword: "",
	newPassword: "",
	newPasswordCheck: "",
};

const passwordRegex: RegExp = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,20}$/;
const passwordRegexFailMent: string = "영문, 숫자, 특수문자 각각 1개이상 포함하는 8자이상 20자 이하 조합";

/* 비밀번호 변경페이지 */
export default function PasswordChangePage() {
	const router = useRouter();

	/* --------- */

	/* --------- */

	// 비번변경 폼 데이터
	const [pwdChangeForm, setPwdChangeForm] = useState<PasswordChangeForm>(initPasswordChangeForm);
	// 비번변경 실패 알람.
	const [pwdChangeFailAlert, setPwdChangeFailAlert] = useState<PasswordChangeForm>(initPasswordChangeForm);
	// 비번변경 성공 알람.
	const [pwdChangeSuccessAlert, setPwdChangeSuccessAlert] = useState<PasswordChangeForm>(initPasswordChangeForm);
	// 비번변경 input들 HTMLInputElement
	const pwdChangeFormRefs = useRef<Partial<PasswordChangeFormRefs>>({});
	// 비번변경 폼 변경
	const changePwdChangeForm = (e: ChangeEvent) => {
		let { name, value } = e.target;
		if (name == "newPasswordCheck") {
			let ment = "";
			if (pwdChangeForm.newPassword && pwdChangeForm.newPasswordCheck != value) {
				ment = "비밀번호와 일치하지 않습니다.";
			}
			setPwdChangeFailAlert((prev) => ({
				...prev,
				[name]: ment,
			}));
		}
		setPwdChangeForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};
	// 유효성 확인 ex) 아이디 중복확인, 정규표현식 확인
	const validateJoinForm = async (e: ChangeEvent) => {
		let { name, value } = e.target;
		value = value.trim();
		let failMent = "";
		let successMent = "";
		const addMentObj: { [key: string]: string } = {};
		if (name === "newPassword") {
			if (!passwordRegex.test(value)) {
				failMent = passwordRegexFailMent;
			}
		}
		setPwdChangeForm((prev) => ({
			...prev,
			[name]: value,
		}));
		setPwdChangeFailAlert((prev) => ({
			...prev,
			[name]: failMent,
			...addMentObj,
		}));
		setPwdChangeSuccessAlert((prev) => ({
			...prev,
			[name]: successMent,
		}));
	};
	// 비밀번호변경 실행
	const passwordChangeSubmit = (e: FormEvent) => {
		e.preventDefault();
	};

	return (
		<main id="passwordChangePage" className="user-wrapper">
			<div className="form-wrap">
				<h2>비밀번호 변경</h2>
				<form onSubmit={passwordChangeSubmit}>
					<JoinInput
						name="curPassword"
						label="현재비밀번호"
						placeholder="현재 비밀번호를 입력해주세요."
						type="password"
						value={pwdChangeForm.curPassword}
						failMessage={pwdChangeFailAlert.curPassword}
						successMessage={pwdChangeSuccessAlert.curPassword}
						onChange={changePwdChangeForm}
						onBlur={validateJoinForm}
						ref={(el) => {
							pwdChangeFormRefs.current.curPassword = el;
						}}
					/>
					<JoinInput
						name="newPassword"
						label="새로운 비밀번호"
						type="password"
						placeholder="새로운 비밀번호를 입력해주세요."
						value={pwdChangeForm.newPassword}
						failMessage={pwdChangeFailAlert.newPassword}
						successMessage={pwdChangeSuccessAlert.newPassword}
						onChange={changePwdChangeForm}
						onBlur={validateJoinForm}
						ref={(el) => {
							pwdChangeFormRefs.current.newPassword = el;
						}}
					/>
					<JoinInput
						name="newPasswordCheck"
						label="비밀번호 확인"
						placeholder="비밀번호를 다시 입력해주세요."
						type="password"
						value={pwdChangeForm.newPasswordCheck}
						failMessage={pwdChangeFailAlert.newPasswordCheck}
						successMessage={pwdChangeSuccessAlert.newPasswordCheck}
						onChange={changePwdChangeForm}
						onBlur={validateJoinForm}
						ref={(el) => {
							pwdChangeFormRefs.current.newPasswordCheck = el;
						}}
					/>
					<div className="submit-wrap info">
						<input type="submit" value={"완료"} />
					</div>
				</form>
			</div>
		</main>
	);
}
