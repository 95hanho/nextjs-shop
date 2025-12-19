/* 아이디, 비밀번호 찾기 */
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
	authNumber: string;
};

type FindUserFormRefs = {
	userId: HTMLInputElement | null;
	phone: HTMLInputElement | null;
	authNumber: HTMLInputElement | null;
};

const initFindUserForm: FindUserForm = {
	userId: "",
	phone: "",
	authNumber: "",
};

const phoneRegex: RegExp = /^(010|011|016|017|018|019)\d{3,4}\d{4}$/;
const phoneRegexFailMent: string = "휴대폰 번호 형식에 일치하지 않습니다.";

export default function FindUser() {
	const router = useRouter();
	const params = useParams<{ type?: FindType }>(); // `type`이 있을 수도 있고 없을 수도 있음
	const findType = params.type;

	/*  */

	useEffect(() => {
		if (!findType || !["id", "password"].includes(findType)) {
			router.push("/user");
		}
	}, []);

	/*  */

	// 휴대폰 인증
	const handlePhoneAuth = useMutation({
		mutationFn: () => postJson<BaseResponse>(getApiUrl(API_URL.AUTH_PHONE_AUTH), { userId: findUserForm.userId, phone: findUserForm.phone }),
		onSuccess(data) {
			setAuthNumberView(true);
			setFindUserFailAlert((prev) => ({
				...prev,
				authNumber: "",
			}));
			setFindUserSuccessAlert((prev) => ({
				...prev,
				authNumber: "인증 번호가 발송되었습니다..",
			}));
		},
		onError(err) {
			console.log(err);
		},
	});
	// 휴대폰 인증확인
	const handlePhoneAuthCheck = useMutation({
		mutationFn: () =>
			postJson<BaseResponse>(getApiUrl(API_URL.AUTH_PHONE_AUTH_CHECK), {
				userId: findUserForm.userId,
				phoneAuthToken,
				authNumber: findUserForm.authNumber,
			}),
		onSuccess(data) {
			setAuthNumberView(false);
			setFindUserFailAlert((prev) => ({
				...prev,
				phone: "",
			}));
			setFindUserSuccessAlert((prev) => ({
				...prev,
				phone: "휴대폰 인증이 완료되었습니다.",
			}));
		},
		onError(err) {
			console.log(err);
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
	const [authNumberView, setAuthNumberView] = useState<boolean>(false);
	// 인증번호 토큰
	const [phoneAuthToken, setPhoneAuthToken] = useState<string | null>(null);
	// 인증번호 인증완료
	const [authCompleteView, setAuthCompleteView] = useState<boolean>(false);
	// 비번변경 폼 변경
	const changeFindUserForm = (e: ChangeEvent) => {
		let { name, value } = e.target;
		setFindUserForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};
	// 유효성 확인 ex) 아이디 중복확인, 정규표현식 확인
	const validatefindUserForm = async (e: ChangeEvent) => {
		let { name, value } = e.target;
		value = value.trim();
		if (!value) return;
		let failMent = "";
		let successMent = "";
		const addMentObj: { [key: string]: string } = {};
		if (name === "phone") {
			if (value && !phoneRegex.test(value)) {
				failMent = phoneRegexFailMent;
			}
		}
		setFindUserForm((prev) => ({
			...prev,
			[name]: value,
		}));
		setFindUserFailAlert((prev) => ({
			...prev,
			[name]: failMent,
			...addMentObj,
		}));
		setFindUserSuccessAlert((prev) => ({
			...prev,
			[name]: successMent,
		}));
	};
	// 비밀번호변경 실행
	const findUserSubmit = (e: FormEvent) => {
		e.preventDefault();
		let alertOn = "";
		const alertKeys = Object.keys(findUserFailAlert) as (keyof FindUserForm)[];
		for (const key of alertKeys) {
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
	};

	if (!findType) return null;
	return (
		<main id="login" className="user-wrapper">
			<div className="form-wrap">
				<h2>
					{findType == "id" ? "아이디" : ""}
					{findType == "password" ? "비밀번호" : ""}찾기
				</h2>
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
								handlePhoneAuth.mutate();
							},
						}}
						onBlur={validatefindUserForm}
						ref={(el) => {
							findUserFormRefs.current.phone = el;
						}}
					/>
					{authNumberView && (
						<JoinInput
							name="authNumber"
							label="인증번호"
							placeholder="휴대폰 인증번호를 입력해주세요."
							value={findUserForm.authNumber}
							failMessage={findUserFailAlert.authNumber}
							successMessage={findUserSuccessAlert.authNumber}
							onChange={changeFindUserForm}
							searchBtn={{
								txt: "확인",
								fnc: () => {
									handlePhoneAuthCheck.mutate();
								},
							}}
							onBlur={validatefindUserForm}
							ref={(el) => {
								findUserFormRefs.current.phone = el;
							}}
						/>
					)}
					<div className="submit-wrap">
						<input type="submit" value={"완료"} />
					</div>
				</form>
			</div>
		</main>
	);
}
