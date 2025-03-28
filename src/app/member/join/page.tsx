"use client";

import { ChangeEvent, FormEvent, JoinForm, JoinFormRefs } from "@/types/form";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import JoinInput from "./JoinInput";

const init_joinForm: JoinForm = {
	id: "",
	password: "",
	password_check: "",
	name: "",
	zonecode: "",
	address: "",
	birthday: "",
	phone: "",
	email: "",
};
const init_joinAlert: JoinForm = {
	id: "",
	password: "",
	password_check: "",
	name: "",
	zonecode: "",
	address: "",
	birthday: "",
	phone: "",
	email: "",
};

const joinFormRegex: { [key: string]: RegExp } = {
	id: /^[a-zA-Z][a-zA-Z0-9_]{5,14}$/,
	password: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,20}$/,
	phone: /^(010|011|016|017|018|019)\d{3,4}\d{4}$/,
	email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
};
const joinFormRegexFailMent: { [key: string]: string } = {
	id: "영문으로 시작하고 영문, 숫자, 언더스코어를 포함하는 6자이상 15자 이하 조합",
	password: "영문, 숫자, 특수문자 각각 1개이상 포함하는 8자이상 20자 이하 조합",
	birthday: "(YYYYMMDD) 생년월일 형식에 맞지 않습니다.",
	phone: "휴대폰 번호 형식에 일치하지 않습니다.",
	email: "이메일 형식에 일치하지 않습니다.",
};
// 유효한 날짜인지 확인
const isValidDateString = (dateStr: string): boolean => {
	if (dateStr.length != 8) return false;

	const year = Number(dateStr.slice(0, 4));
	const month = Number(dateStr.slice(4, 6));
	const day = Number(dateStr.slice(6, 8));

	console.log(year, month, day);

	if (year < 1900 || new Date().getFullYear() < year) return false;
	if (month < 1 || 12 < month) return false;
	// 윤년인지
	const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	const daysIsMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	if (day > daysIsMonth[month - 1]) return false;
	return true;
};

export default function Member_join() {
	const [joinForm, set_joinForm] = useState(init_joinForm);
	const [joinAlert, set_joinAlert] = useState(init_joinAlert);
	const joinFormRefs = useRef<Partial<JoinFormRefs>>({});

	const change_joinForm = (e: ChangeEvent) => {
		let { name, value } = e.target;
		if (name == "password_check") {
			let ment = "";
			if (joinForm.password && joinForm.password != value) {
				ment = "비밀번호와 일치하지 않습니다.";
			}
			set_joinAlert((prev) => ({
				...prev,
				[name]: ment,
			}));
		}
		set_joinForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const validate_joinForm = (e: ChangeEvent) => {
		let { name, value } = e.target;
		value = value.trim();
		let ment = "";
		if (joinFormRegex[name]) {
			if (!joinFormRegex[name].test(value)) {
				ment = joinFormRegexFailMent[name];
			}
		} else if (name == "birthday") {
			const numericValue = value.replace(/[^0-9]/g, ""); // 숫자가 아닌 문자는 제거
			if (!isValidDateString(numericValue)) {
				ment = joinFormRegexFailMent[name];
			} else {
				value =
					numericValue.slice(0, 4) +
					"/" +
					numericValue.slice(4, 6) +
					"/" +
					numericValue.slice(6, 8);
			}
		}
		set_joinForm((prev) => ({
			...prev,
			[name]: value,
		}));
		set_joinAlert((prev) => ({
			...prev,
			[name]: ment,
		}));
	};

	const join_submit = (e: FormEvent) => {
		console.log("join_submit");
		e.preventDefault();
		const keys = Object.keys(joinForm);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			const value = joinForm[key];
			const alertOn = joinAlert[key];
			if (!alertOn && !value) {
				set_joinAlert((prev) => ({
					...prev,
					[key]: "해당 내용을 입력해주세요.",
				}));
				joinFormRefs.current[key]?.focus();
				break;
			}
			if (alertOn) {
				joinFormRefs.current[key]?.focus();
				break;
			}
		}
		// 회원가입 로직 추가
	};

	const addressPopup = () => {
		new window.daum.Postcode({
			oncomplete: (data) => {
				const fullAddress = data.roadAddress || data.jibunAddress;
				set_joinForm((prev) => ({
					...prev,
					zonecode: fullAddress,
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
						name="id"
						label="아이디"
						placeholder="아이디를 입력해주세요."
						value={joinForm.id}
						alertMessage={joinAlert.id}
						onChange={change_joinForm}
						onBlur={validate_joinForm}
						ref={(el) => {
							joinFormRefs.current.id = el;
						}}
					/>
					<JoinInput
						name="password"
						label="비밀번호"
						placeholder="비밀번호를 입력해주세요."
						type="password"
						value={joinForm.password}
						alertMessage={joinAlert.password}
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
						alertMessage={joinAlert.password_check}
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
						alertMessage={joinAlert.name}
						onChange={change_joinForm}
						onBlur={validate_joinForm}
						ref={(el) => {
							joinFormRefs.current.name = el;
						}}
					/>
					<JoinInput
						name="zonecode"
						label="주소"
						placeholder="주소를 입력해주세요."
						value={joinForm.zonecode}
						alertMessage={joinAlert.zonecode}
						readOnly
						onClick={addressPopup}
						onBlur={validate_joinForm}
						searchBtn={{ txt: "검색", fnc: addressPopup }}
					/>
					<JoinInput
						name="address"
						label="상세주소"
						placeholder="상세주소를 입력해주세요."
						value={joinForm.address}
						alertMessage={joinAlert.address}
						onChange={change_joinForm}
						onBlur={validate_joinForm}
						ref={(el) => {
							joinFormRefs.current.address = el;
						}}
					/>
					<JoinInput
						name="birthday"
						label="생년월일"
						placeholder="YYYY/MM/DD"
						value={joinForm.birthday}
						alertMessage={joinAlert.birthday}
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
						alertMessage={joinAlert.phone}
						onChange={change_joinForm}
						searchBtn={{ txt: "인증", fnc: () => {} }}
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
						alertMessage={joinAlert.email}
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
