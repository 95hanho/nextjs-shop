/* 아이디, 비밀번호 찾기 클라 */
"use client";

import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import JoinInput from "@/components/user/JoinInput";
import { getApiUrl } from "@/lib/getBaseUrl";
import { ChangeEvent, FormEvent } from "@/types/auth";
import { BaseResponse } from "@/types/common";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type FindType = "id" | "password";

type FindUserForm = {
	userId: string;
	phone: string;
	phoneAuth: string;
};

type FindUserFormRefs = {
	userId: HTMLInputElement | null;
	phone: HTMLInputElement | null;
	phoneAuth: HTMLInputElement | null;
};

const initFindUserForm: FindUserForm = {
	userId: "",
	phone: "",
	phoneAuth: "",
};

const phoneRegex: RegExp = /^(010|011|016|017|018|019)\d{3,4}\d{4}$/;
const phoneRegexFailMent: string = "휴대폰 번호 형식에 일치하지 않습니다.";

export default function FindUserClient() {
	const { push } = useRouter();
	const params = useParams<{ type?: FindType }>(); // `type`이 있을 수도 있고 없을 수도 있음
	const findType = params.type;

	/*  */

	useEffect(() => {
		if (!findType || !["id", "password"].includes(findType)) {
			push("/user");
		}
	}, []);

	/*  */

	// 휴대폰 인증
	const handlePhoneAuth = useMutation({
		mutationFn: () =>
			postJson<BaseResponse & { phoneAuthToken: string }>(getApiUrl(API_URL.AUTH_PHONE_AUTH), {
				userId: findUserForm.userId,
				phone: findUserForm.phone,
			}),
		onSuccess(data) {
			setAuthNumberView(true);
			setPhoneAuthToken(data.phoneAuthToken);
			setPhoneAuthComplete(false);
			setFindUserFailAlert((prev) => ({
				...prev,
				phone: "",
				phoneAuth: "",
			}));
			setFindUserSuccessAlert((prev) => ({
				...prev,
				phone: "",
				phoneAuth: "인증 번호가 발송되었습니다. 제한시간 3분",
			}));
			setFindUserForm((prev) => ({
				...prev,
				phoneAuth: "",
			}));
		},
		onError(err) {
			console.log(err);
		},
	});
	// 휴대폰 인증확인
	const handlePhoneAuthComplete = useMutation({
		mutationFn: () =>
			postJson<BaseResponse & { userId: string }>(getApiUrl(API_URL.AUTH_PHONE_AUTH_CHECK), {
				userId: findUserForm.userId,
				phoneAuthToken,
				authNumber: findUserForm.phoneAuth,
			}),
		onSuccess(data) {
			if (findType === "id") {
				setFindId(data.userId);
				setPhoneAuthComplete(true);
			} else if (findType === "password") {
				// 비밀번호 변경페이지로
				push("/user/password");
			}
		},
		onError(err) {
			console.log(err);
			if (["VERIFICATION_EXPIRED", "PHONEAUTH_TOKEN_UNAUTHORIZED"].includes(err.message)) {
				setFindUserFailAlert((prev) => ({
					...prev,
					phone: "인증시간이 만료되었습니다.",
				}));
				setAuthNumberView(false);
			}
			if (err.message === "INVALID_VERIFICATION_CODE") {
				setFindUserFailAlert((prev) => ({
					...prev,
					phoneAuth: "인증번호가 일치하지 않습니다.",
				}));
			}
		},
	});

	/*  */
	// 비번변경 폼 데이터
	const [findUserForm, setFindUserForm] = useState<FindUserForm>(initFindUserForm);
	// 비번변경 실패 알람.
	const [findUserFailAlert, setFindUserFailAlert] = useState<FindUserForm>(initFindUserForm);
	// 비번변경 성공 알람.
	const [findUserSuccessAlert, setFindUserSuccessAlert] = useState<FindUserForm>(initFindUserForm);
	// 비번변경 input들 HTMLInputElement
	const findUserFormRefs = useRef<Partial<FindUserFormRefs>>({});
	// 인증번호 화면 띄울지
	const [phoneAuthView, setAuthNumberView] = useState<boolean>(false);
	// 인증번호 토큰
	const [phoneAuthToken, setPhoneAuthToken] = useState<string | null>(null);
	// 인증번호 인증완료
	const [phoneAuthComplete, setPhoneAuthComplete] = useState<boolean>(false);
	// 찾은 아이디
	const [findId, setFindId] = useState<string>("");

	// 비번변경 폼 변경
	const changeFindUserForm = (e: ChangeEvent) => {
		let { name, value } = e.target as {
			name: keyof FindUserForm;
			value: string;
		};
		let nextValue: string | number = value;

		if (name === "phone") {
			nextValue = value.replace(/[^0-9]/g, "").slice(0, 13); // 예: 13자리 인증번호
			setPhoneAuthComplete(false);
			setFindUserSuccessAlert((prev) => ({
				...prev,
				[name]: "",
			}));
		}
		if (name === "phoneAuth") {
			nextValue = value.replace(/[^0-9]/g, "").slice(0, 6); // 예: 6자리 인증번호
		}

		setFindUserForm((prev) => ({
			...prev,
			[name]: nextValue as FindUserForm[typeof name],
		}));
	};
	// 유효성 확인 ex) 아이디 중복확인, 정규표현식 확인
	const validatefindUserForm = async (e: ChangeEvent) => {
		let { name, value } = e.target as {
			name: keyof FindUserForm;
			value: string;
		};
		value = value.trim();
		let failMent = "";
		let successMent = "";
		if (name === "phone") {
			if (value && !phoneRegex.test(value)) {
				failMent = phoneRegexFailMent;
			}
		} else if (name === "phoneAuth") {
			if (value.length < 6) {
				failMent = "인증번호 6자리를 입력해주세요.";
			}
		}
		setFindUserForm((prev) => ({
			...prev,
			[name]: value,
		}));
		setFindUserFailAlert((prev) => ({
			...prev,
			[name]: failMent,
		}));
		setFindUserSuccessAlert((prev) => ({
			...prev,
			[name]: successMent,
		}));
	};
	// 비밀번호변경 제출
	const findUserSubmit = (e: FormEvent) => {
		console.log("findUserSubmit");
		e.preventDefault();
		let alertOn = "";
		const alertKeys = Object.keys(findUserFailAlert) as (keyof FindUserForm)[];
		for (const key of alertKeys) {
			if (!findUserFormRefs.current[key]) continue;
			const value = findUserForm[key];
			alertOn = findUserFailAlert[key];
			// 알람없을 때 처음 누를 때
			if (!alertOn) {
				if (!value) {
					alertOn = "해당 내용을 입력해주세요.";
				}
			}
			// 알람있을 때 또 눌렀으면
			if (alertOn) {
				setFindUserFailAlert((prev) => ({
					...prev,
					[key]: alertOn,
				}));
				findUserFormRefs.current[key]?.focus();
				break;
			}
		}
		if (alertOn) return;
		//
		console.log("비밀번호변경 제출");
	};

	// ---------------------

	// 휴대폰 인증 보내기 버튼
	const clickPhoneAuth = () => {
		if (!findUserForm.phone) {
			setFindUserFailAlert((prev) => ({
				...prev,
				phone: "휴대폰 번호를 입력해주세요.",
			}));
			findUserFormRefs.current.phone?.focus();
			return;
		}
		if (findUserFailAlert.phone) {
			findUserFormRefs.current.phone?.focus();
			return;
		}
		handlePhoneAuth.mutate();
	};
	// 휴대폰 인증확인 버튼
	const clickCheckPhoneAuth = () => {
		if (findUserFailAlert.phoneAuth) {
			findUserFormRefs.current.phoneAuth?.focus();
			return;
		}
		handlePhoneAuthComplete.mutate();
	};

	if (!findType) return null;
	return (
		<main id="login" className="user-wrapper">
			<div className="form-wrap">
				<h2>
					{findType == "id" ? "아이디" : ""}
					{findType == "password" ? "비밀번호" : ""}찾기
				</h2>
				{!phoneAuthComplete ? (
					<form onSubmit={findUserSubmit}>
						{findType == "password" && (
							<JoinInput
								name="userId"
								label="아이디"
								placeholder="아이디를 입력해주세요."
								value={findUserForm.userId}
								failMessage={findUserFailAlert.userId}
								successMessage={findUserSuccessAlert.userId}
								onChange={changeFindUserForm}
								onBlur={validatefindUserForm}
								ref={(el) => {
									findUserFormRefs.current.userId = el;
								}}
							/>
						)}
						<JoinInput
							name="phone"
							label="휴대폰"
							placeholder="휴대폰번호를 입력해주세요."
							type="tel"
							value={findUserForm.phone}
							failMessage={findUserFailAlert.phone}
							successMessage={findUserSuccessAlert.phone}
							onChange={changeFindUserForm}
							searchBtn={{
								txt: "인증",
								fnc: () => {
									clickPhoneAuth();
								},
							}}
							onBlur={validatefindUserForm}
							ref={(el) => {
								findUserFormRefs.current.phone = el;
							}}
							inputMode="numeric"
							pattern="[0-9]*"
							maxLength={11}
						/>
						{phoneAuthView && (
							<JoinInput
								name="phoneAuth"
								label="인증번호"
								placeholder="인증번호를 입력해주세요."
								value={findUserForm.phoneAuth}
								failMessage={findUserFailAlert.phoneAuth}
								successMessage={findUserSuccessAlert.phoneAuth}
								onChange={changeFindUserForm}
								searchBtn={{
									txt: "확인",
									fnc: () => {
										clickCheckPhoneAuth();
									},
								}}
								onBlur={validatefindUserForm}
								ref={(el) => {
									findUserFormRefs.current.phoneAuth = el;
								}}
								inputMode="numeric"
								pattern="[0-9]*"
								maxLength={6}
							/>
						)}
					</form>
				) : (
					<div className="find-result">
						{findType === "id" && (
							<div className="find-result__id">
								<div className="find-result__id-info">
									<p className="find-result__id-text">
										<span>아이디 : </span>
										<span className="find-result__id-value">{findId}</span>
									</p>
								</div>
								<div className="find-result__actions">
									<Link className="find-result__btn find-result__btn--login" href={"/user"}>
										로그인
									</Link>
									<Link className="find-result__btn find-result__btn--password" href={"/user/find/password"}>
										비밀번호 찾기
									</Link>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</main>
	);
}
