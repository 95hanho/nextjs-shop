"use client";

import { ChangeEvent, FormEvent, JoinForm, JoinFormAlert, JoinFormRefs } from "@/types/form";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import JoinInput from "../../../components/member/JoinInput";
import { authService } from "@/api";
import useMember from "@/hooks/services/useMember";
import { isValidDateString } from "@/utils/ui";

const init_joinForm: JoinForm = {
	user_id: "hoseongs",
	password: "aaaaaa1!",
	password_check: "aaaaaa1!",
	name: "한호성",
	zonecode: "05718",
	address: "서울 송파구 중대로 121",
	address_detail: "2층",
	birthday: "1995/08/14",
	phone: "01085546674",
	email: "ehfqntuqntu@naver.com",
};
const init_joinAlert: JoinFormAlert = {
	user_id: "",
	password: "",
	password_check: "",
	name: "",
	address: "",
	address_detail: "",
	birthday: "",
	phone: "",
	email: "",
};

const joinFormRegex: { [key: string]: RegExp } = {
	user_id: /^[a-zA-Z][a-zA-Z0-9_]{5,14}$/,
	password: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,20}$/,
	phone: /^(010|011|016|017|018|019)\d{3,4}\d{4}$/,
	email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
};
const joinFormRegexFailMent: { [key: string]: string } = {
	user_id: "영문으로 시작하고 영문, 숫자, 언더스코어를 포함하는 6자이상 15자 이하 조합",
	password: "영문, 숫자, 특수문자 각각 1개이상 포함하는 8자이상 20자 이하 조합",
	birthday: "(YYYYMMDD) 생년월일 형식에 맞지 않습니다.",
	phone: "휴대폰 번호 형식에 일치하지 않습니다.",
	email: "이메일 형식에 일치하지 않습니다.",
};

export default function Member_join() {
	const { handleRegister, handleIdDuplcheck } = useMember();

	const [joinForm, set_joinForm] = useState(init_joinForm);
	const [joinFailAlert, set_joinFailAlert] = useState(init_joinAlert);
	const [joinSuccessAlert, set_joinSuccessAlert] = useState(init_joinAlert);
	const joinFormRefs = useRef<Partial<JoinFormRefs>>({});
	const [idDuplCheck, set_idDuplCheck] = useState(false);
	const [phoneAuth, set_phoneAuth] = useState(false);

	const change_joinForm = (e: ChangeEvent) => {
		let { name, value } = e.target;
		if (name == "password_check") {
			let ment = "";
			if (joinForm.password && joinForm.password != value) {
				ment = "비밀번호와 일치하지 않습니다.";
			}
			set_joinFailAlert((prev) => ({
				...prev,
				[name]: ment,
			}));
		}
		if (name == "phone") {
			set_phoneAuth(false);
			set_joinSuccessAlert((prev) => ({
				...prev,
				[name]: "",
			}));
		}
		set_joinForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const validate_joinForm = async (e: ChangeEvent) => {
		console.log("validate_joinForm");
		let { name, value } = e.target;
		value = value.trim();
		let failMent = "";
		let successMent = "";
		const addMentObj: { [key: string]: string } = {};
		if (joinFormRegex[name]) {
			if (!joinFormRegex[name].test(value)) {
				failMent = joinFormRegexFailMent[name];
			}
		}
		if (!failMent) {
			if (name == "user_id") {
				try {
					await handleIdDuplcheck.mutateAsync(joinForm.user_id);
					successMent = "사용가능한 아이디입니다.";
					set_idDuplCheck(true);
				} catch {
					failMent = "중복된 아이디가 존재합니다.";
					set_idDuplCheck(false);
				}
			} else if (name == "password") {
				if (joinForm.password_check && joinForm.password_check != value) {
					addMentObj.password_check = "비밀번호와 일치하지 않습니다.";
				} else addMentObj.password_check = "";
			} else if (name == "password_check") {
				if (joinForm.password && joinForm.password != value) {
					failMent = "비밀번호와 일치하지 않습니다.";
				}
			} else if (name == "birthday") {
				const numericValue = value.replace(/[^0-9]/g, ""); // 숫자가 아닌 문자는 제거
				if (!isValidDateString(numericValue)) {
					failMent = joinFormRegexFailMent[name];
				} else {
					value = numericValue.slice(0, 4) + "/" + numericValue.slice(4, 6) + "/" + numericValue.slice(6, 8);
				}
			} else if (name == "phone") {
				if (joinSuccessAlert.phone) {
					successMent = joinSuccessAlert.phone;
				}
				if (joinFailAlert.phone == "휴대폰 인증이 필요합니다.") {
					failMent = joinFailAlert.phone;
				}
			}
		}
		set_joinForm((prev) => ({
			...prev,
			[name]: value,
		}));
		set_joinFailAlert((prev) => ({
			...prev,
			[name]: failMent,
			...addMentObj,
		}));
		set_joinSuccessAlert((prev) => ({
			...prev,
			[name]: successMent,
		}));
	};

	const join_submit = (e: FormEvent) => {
		console.log("join_submit");
		e.preventDefault();
		// const keys = Object.keys(joinForm) as (keyof JoinForm)[];
		let alertOn = "";
		const alertKeys = Object.keys(joinFailAlert) as (keyof JoinFormAlert)[];
		for (const key of alertKeys) {
			// for (let i = 0; i < keys.length; i++) {
			// const key = keys[i];
			const value = joinForm[key];
			alertOn = joinFailAlert[key];
			// 알람없을 때 처음 누를 때
			if (!alertOn) {
				if (!value) {
					alertOn = "해당 내용을 입력해주세요.";
				} else if (key == "user_id" && !idDuplCheck) {
					alertOn = "아이디 중복확인을 해주세요.";
				} else if (key == "phone" && !phoneAuth) {
					alertOn = "휴대폰 인증이 필요합니다.";
				}
			}
			// 알람있을 때 또 눌렀으면
			if (alertOn) {
				set_joinFailAlert((prev) => ({
					...prev,
					[key]: alertOn,
				}));
				joinFormRefs.current[key]?.focus();
				break;
			}
		}
		if (alertOn) return;
		// 회원가입 로직 추가
		console.log(joinForm);
		handleRegister.mutate(joinForm);
	};

	const addressPopup = () => {
		new window.daum.Postcode({
			oncomplete: (data) => {
				const fullAddress = data.roadAddress || data.jibunAddress;
				set_joinForm((prev) => ({
					...prev,
					address: fullAddress,
				}));
			},
		}).open({
			popupKey: "addpopup1",
		});
	};

	return (
		<div id="memberJoin" className="member-wrapper">
			<div className="form-wrap join">
				<h2>
					<Link href={"/"}>NextJS-SHOP</Link>
				</h2>
				<form onSubmit={join_submit}>
					<JoinInput
						name="user_id"
						label="아이디"
						placeholder="아이디를 입력해주세요."
						value={joinForm.user_id}
						failMessage={joinFailAlert.user_id}
						successMessage={joinSuccessAlert.user_id}
						onChange={change_joinForm}
						onBlur={validate_joinForm}
						ref={(el) => {
							joinFormRefs.current.user_id = el;
						}}
					/>
					<JoinInput
						name="password"
						label="비밀번호"
						placeholder="비밀번호를 입력해주세요."
						type="password"
						value={joinForm.password}
						failMessage={joinFailAlert.password}
						onChange={change_joinForm}
						onBlur={validate_joinForm}
						ref={(el) => {
							joinFormRefs.current.password = el;
						}}
					/>
					<JoinInput
						name="password_check"
						label="비밀번호 확인"
						placeholder="비밀번호를 한 번 더 입력해주세요."
						type="password"
						value={joinForm.password_check}
						failMessage={joinFailAlert.password_check}
						onChange={change_joinForm}
						onBlur={validate_joinForm}
						ref={(el) => {
							joinFormRefs.current.password_check = el;
						}}
					/>
					<div className="join-space"></div>
					<JoinInput
						name="name"
						label="이름"
						placeholder="이름을 입력해주세요."
						value={joinForm.name}
						failMessage={joinFailAlert.name}
						onChange={change_joinForm}
						onBlur={validate_joinForm}
						ref={(el) => {
							joinFormRefs.current.name = el;
						}}
					/>
					<JoinInput
						name="address"
						label="주소"
						placeholder="주소를 입력해주세요."
						value={joinForm.address}
						failMessage={joinFailAlert.address}
						readOnly
						onClick={addressPopup}
						onBlur={validate_joinForm}
						searchBtn={{ txt: "검색", fnc: addressPopup }}
					/>
					<JoinInput
						name="address_detail"
						label="상세주소"
						placeholder="상세주소를 입력해주세요."
						value={joinForm.address_detail}
						failMessage={joinFailAlert.address_detail}
						onChange={change_joinForm}
						onBlur={validate_joinForm}
						ref={(el) => {
							joinFormRefs.current.address_detail = el;
						}}
					/>
					<JoinInput
						name="birthday"
						label="생년월일"
						placeholder="YYYY/MM/DD"
						value={joinForm.birthday}
						failMessage={joinFailAlert.birthday}
						onChange={change_joinForm}
						onBlur={validate_joinForm}
						ref={(el) => {
							joinFormRefs.current.birthday = el;
						}}
					/>
					<div className="join-space"></div>
					<JoinInput
						name="phone"
						label="휴대폰"
						placeholder="휴대폰번호를 입력해주세요."
						type="tel"
						value={joinForm.phone}
						failMessage={joinFailAlert.phone}
						successMessage={joinSuccessAlert.phone}
						onChange={change_joinForm}
						searchBtn={{
							txt: "인증",
							fnc: () => {
								set_phoneAuth(true);
								set_joinFailAlert((prev) => ({
									...prev,
									phone: "",
								}));
								set_joinSuccessAlert((prev) => ({
									...prev,
									phone: "휴대폰 인증이 완료되었습니다.",
								}));
							},
						}}
						onBlur={validate_joinForm}
						ref={(el) => {
							joinFormRefs.current.phone = el;
						}}
					/>
					<JoinInput
						name="email"
						label="이메일"
						placeholder="이메일을 입력해주세요."
						type="text"
						value={joinForm.email}
						failMessage={joinFailAlert.email}
						onChange={change_joinForm}
						onBlur={validate_joinForm}
						ref={(el) => {
							joinFormRefs.current.email = el;
						}}
					/>
					<div className="submit-wrap">
						<input type="submit" value={"회원가입"} />
					</div>
				</form>
			</div>
		</div>
	);
}
