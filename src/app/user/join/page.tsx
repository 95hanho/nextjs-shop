/* 회원가입 */
"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import JoinInput from "../../../components/user/JoinInput";
import { isValidDateString } from "@/utils/ui";
import { useMutation } from "@tanstack/react-query";
import { getNormal, postJson, postUrlFormData } from "@/api/fetchFilter";
import { BaseResponse } from "@/types/common";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { ChangeEvent, FormEvent, JoinForm, JoinFormAlert, JoinFormRefs } from "@/types/auth";
import { useRouter } from "next/navigation";

const initJoinForm: JoinForm = {
	userId: "hoseongs",
	password: "aaaaaa1!",
	passwordCheck: "aaaaaa1!",
	name: "한호성",
	zonecode: "05718",
	address: "서울 송파구 중대로 121",
	addressDetail: "2층",
	birthday: "1995/08/14",
	phone: "01085546674",
	phoneAuth: "",
	email: "ehfqntuqntu@naver.com",
};
const initJoinAlert: JoinFormAlert = {
	userId: "",
	password: "",
	passwordCheck: "",
	name: "",
	address: "",
	addressDetail: "",
	birthday: "",
	phone: "",
	phoneAuth: "",
	email: "",
};

const joinFormRegex: { [key: string]: RegExp } = {
	userId: /^[a-zA-Z][a-zA-Z0-9_]{5,14}$/,
	password: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,20}$/,
	phone: /^(010|011|016|017|018|019)\d{3,4}\d{4}$/,
	email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
};
const joinFormRegexFailMent: { [key: string]: string } = {
	userId: "영문으로 시작하고 영문, 숫자, 언더스코어를 포함하는 6자이상 15자 이하 조합",
	password: "영문, 숫자, 특수문자 각각 1개이상 포함하는 8자이상 20자 이하 조합",
	birthday: "(YYYYMMDD) 생년월일 형식에 맞지 않습니다.",
	phone: "휴대폰 번호 형식에 일치하지 않습니다.",
	email: "이메일 형식에 일치하지 않습니다.",
};

export default function UserJoin() {
	const router = useRouter();

	// 회원가입 폼 데이터
	const [joinForm, setJoinForm] = useState<JoinForm>(initJoinForm);
	// 회원가입 실패 알람.
	const [joinFailAlert, setJoinFailAlert] = useState<JoinFormAlert>(initJoinAlert);
	// 회원가입 성공 알람.
	const [joinSuccessAlert, setJoinSuccessAlert] = useState<JoinFormAlert>(initJoinAlert);
	// 회원가입 input들 HTMLInputElement
	const joinFormRefs = useRef<Partial<JoinFormRefs>>({});
	// 아이디중복여부
	const [idDuplCheck, setIdDuplCheck] = useState<boolean>(false);
	// 인증번호 화면 띄울지
	const [authNumberView, setAuthNumberView] = useState<boolean>(false);
	// 인증번호 토큰
	const [phoneAuthToken, setPhoneAuthToken] = useState<string | null>(null);
	// 휴대폰인증완료여부
	const [phoneAuthComplete, setPhoneAuthComplete] = useState<boolean>(false);

	// 아이디중복확인 mutate
	const handleIdDuplcheck = useMutation({
		mutationFn: (userId: string) => postUrlFormData<BaseResponse>(getApiUrl(API_URL.AUTH_ID), { userId }),
		// Mutation이 시작되기 직전에 특정 작업을 수행
		onMutate(a) {
			console.log(a);
		},
		onSuccess(data) {
			console.log(data);
		},
		onError(err) {
			console.log(err);
		},
		// 결과에 관계 없이 무언가 실행됨
		onSettled(a, b) {},
	});
	// 휴대폰 인증
	const handlePhoneAuth = useMutation({
		mutationFn: () => postJson<BaseResponse & { phoneAuthToken: string }>(getApiUrl(API_URL.AUTH_PHONE_AUTH), { phone: joinForm.phone }),
		onSuccess(data) {
			setAuthNumberView(true);
			setPhoneAuthToken(data.phoneAuthToken);
			setPhoneAuthComplete(false);
			setJoinFailAlert((prev) => ({
				...prev,
				phone: "",
				phoneAuth: "",
			}));
			setJoinSuccessAlert((prev) => ({
				...prev,
				phone: "",
				phoneAuth: "인증 번호가 발송되었습니다. 제한시간 3분",
			}));
			setJoinForm((prev) => ({
				...prev,
				phoneAuth: "",
			}));
		},
		onError(err) {
			console.log(err);
		},
	});
	// 휴대폰 인증 확인
	const handlePhoneAuthComplete = useMutation({
		mutationFn: () =>
			postJson<BaseResponse>(getApiUrl(API_URL.AUTH_PHONE_AUTH_CHECK), {
				phone: joinForm.phone,
				phoneAuthToken,
				authNumber: joinForm.phoneAuth,
			}),
		onSuccess(data) {
			setPhoneAuthComplete(true);
			setAuthNumberView(false);
			setJoinFailAlert((prev) => ({
				...prev,
				phone: "",
				phoneAuth: "",
			}));
			setJoinSuccessAlert((prev) => ({
				...prev,
				phone: "휴대폰 인증이 완료되었습니다.",
				phoneAuth: "",
			}));
		},
		onError(err) {
			console.log(err);
			if (["VERIFICATION_EXPIRED", "PHONEAUTH_TOKEN_UNAUTHORIZED"].includes(err.message)) {
				setJoinFailAlert((prev) => ({
					...prev,
					phone: "인증시간이 만료되었습니다.",
				}));
				setAuthNumberView(false);
			}
			if (err.message === "INVALID_VERIFICATION_CODE") {
				setJoinFailAlert((prev) => ({
					...prev,
					phoneAuth: "인증번호가 일치하지 않습니다.",
				}));
			}
		},
	});
	// 회원가입
	const handleRegister = useMutation({
		mutationFn: () => postJson<BaseResponse>(getApiUrl(API_URL.AUTH_JOIN), { ...joinForm }),
		// Mutation이 시작되기 직전에 특정 작업을 수행
		onMutate(a) {
			console.log(a);
		},
		onSuccess(data) {
			console.log(data);
			alert("회원가입이 완료되었습니다.");
			router.push("/user");
		},
		onError(err) {
			console.log(err);
			if (err.message === "PHONEAUTH_COMPLETE_UNAUTHORIZED") {
				setPhoneAuthComplete(false);
				setJoinSuccessAlert((prev) => ({
					...prev,
					phone: "",
				}));
				setJoinFailAlert((prev) => ({
					...prev,
					phone: "인증시간이 만료되었습니다. 다시 인증해주세요.",
				}));
			}
		},
		// 결과에 관계 없이 무언가 실행됨
		onSettled(a, b) {
			console.log(a, b);
		},
	});

	// joinForm set
	const changeJoinForm = (e: ChangeEvent) => {
		const { name, value } = e.target as {
			name: keyof JoinForm;
			value: string;
		};
		let nextValue: string | number = value;

		if (name == "passwordCheck") {
			let ment = "";
			if (joinForm.password && joinForm.password != value) {
				ment = "비밀번호와 일치하지 않습니다.";
			}
			setJoinFailAlert((prev) => ({
				...prev,
				[name]: ment,
			}));
		}
		if (name === "phone") {
			nextValue = value.replace(/[^0-9]/g, "").slice(0, 13); // 예: 13자리 인증번호
			setPhoneAuthComplete(false);
			setJoinSuccessAlert((prev) => ({
				...prev,
				[name]: "",
			}));
		}
		if (name === "phoneAuth") {
			nextValue = value.replace(/[^0-9]/g, "").slice(0, 6); // 예: 6자리 인증번호
			setJoinFailAlert((prev) => ({
				...prev,
				phone: "",
			}));
		}
		setJoinForm((prev) => ({
			...prev,
			[name]: nextValue as JoinForm[typeof name],
		}));
	};
	// 유효성 확인 ex) 아이디 중복확인, 정규표현식 확인
	const validateJoinForm = async (e: ChangeEvent) => {
		let { name, value } = e.target as {
			name: keyof JoinForm;
			value: string;
		};
		value = value.trim();
		let failMent = "";
		let successMent = "";
		const addFailMentObj: { [key: string]: string } = {};
		if (joinFormRegex[name]) {
			if (!joinFormRegex[name].test(value)) {
				failMent = joinFormRegexFailMent[name];
			}
		}
		if (!value) {
			failMent = "";
			successMent = "";
		} else if (!failMent) {
			if (name == "userId") {
				try {
					await handleIdDuplcheck.mutateAsync(joinForm.userId);
					successMent = "사용가능한 아이디입니다.";
					setIdDuplCheck(true);
				} catch (err: any) {
					if (err.message === "ID_DUPLICATED") {
						failMent = "중복된 아이디가 존재합니다.";
						setIdDuplCheck(false);
					}
				}
			} else if (name == "password") {
				if (joinForm.passwordCheck && joinForm.passwordCheck != value) {
					addFailMentObj.passwordCheck = "비밀번호와 일치하지 않습니다.";
				} else addFailMentObj.passwordCheck = "";
			} else if (name == "passwordCheck") {
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
			} else if (name === "phoneAuth") {
				if (value.length < 6) {
					failMent = "인증번호 6자리를 입력해주세요.";
				}
			}
		}
		setJoinForm((prev) => ({
			...prev,
			[name]: value,
		}));
		setJoinFailAlert((prev) => ({
			...prev,
			[name]: failMent,
			...addFailMentObj,
		}));
		setJoinSuccessAlert((prev) => ({
			...prev,
			[name]: successMent,
		}));
	};
	// 회원가입 완료
	const joinSubmit = (e: FormEvent) => {
		console.log("joinSubmit");
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
				} else if (key == "userId" && !idDuplCheck) {
					alertOn = "아이디 중복확인을 해주세요.";
				} else if (key == "phone" && !phoneAuthComplete) {
					alertOn = "휴대폰 인증이 필요합니다.";
				}
			}
			// 알람있을 때 또 눌렀으면
			if (alertOn) {
				setJoinFailAlert((prev) => ({
					...prev,
					[key]: alertOn,
				}));
				joinFormRefs.current[key]?.focus();
				break;
			}
		}
		if (alertOn) return;
		// 회원가입 로직 추가
		console.log("회원가입 완료");
		handleRegister.mutate();
	};
	// 주소API 팝업 띄우기
	const addressPopup = () => {
		new window.daum.Postcode({
			oncomplete: (data) => {
				const fullAddress = data.roadAddress || data.jibunAddress;
				setJoinForm((prev) => ({
					...prev,
					zonecode: data.zonecode,
					address: fullAddress,
				}));
			},
		}).open({
			popupKey: "addpopup1",
		});
	};
	// 휴대폰 인증 보내기 버튼
	const clickPhoneAuth = () => {
		if (!joinForm.phone) {
			setJoinFailAlert((prev) => ({
				...prev,
				phone: "휴대폰 번호를 입력해주세요.",
			}));
			joinFormRefs.current.phone?.focus();
			return;
		}
		if (joinFormRegex.phone) {
			if (!joinFormRegex.phone.test(joinForm.phone)) {
				setJoinFailAlert((prev) => ({
					...prev,
					phone: joinFormRegexFailMent.phone,
				}));
				joinFormRefs.current.phone?.focus();
				return;
			}
		}
		handlePhoneAuth.mutate();
	};
	// 휴대폰 인증확인 버튼
	const clickCheckPhoneAuth = () => {
		if (joinFailAlert.phoneAuth) {
			joinFormRefs.current.phoneAuth?.focus();
			return;
		}
		handlePhoneAuthComplete.mutate();
	};

	return (
		<main id="userJoin" className="user-wrapper">
			<div className="form-wrap join">
				<h2>
					<Link href={"/"}>NextJS-SHOP</Link>
				</h2>
				<form onSubmit={joinSubmit}>
					<JoinInput
						name="userId"
						label="아이디"
						placeholder="아이디를 입력해주세요."
						value={joinForm.userId}
						failMessage={joinFailAlert.userId}
						successMessage={joinSuccessAlert.userId}
						onChange={changeJoinForm}
						onBlur={validateJoinForm}
						ref={(el) => {
							joinFormRefs.current.userId = el;
						}}
					/>
					<JoinInput
						name="password"
						label="비밀번호"
						placeholder="비밀번호를 입력해주세요."
						type="password"
						value={joinForm.password}
						failMessage={joinFailAlert.password}
						onChange={changeJoinForm}
						onBlur={validateJoinForm}
						ref={(el) => {
							joinFormRefs.current.password = el;
						}}
					/>
					<JoinInput
						name="passwordCheck"
						label="비밀번호 확인"
						placeholder="비밀번호를 한 번 더 입력해주세요."
						type="password"
						value={joinForm.passwordCheck}
						failMessage={joinFailAlert.passwordCheck}
						onChange={changeJoinForm}
						onBlur={validateJoinForm}
						ref={(el) => {
							joinFormRefs.current.passwordCheck = el;
						}}
					/>
					<div className="join-space"></div>
					<JoinInput
						name="name"
						label="이름"
						placeholder="이름을 입력해주세요."
						value={joinForm.name}
						failMessage={joinFailAlert.name}
						onChange={changeJoinForm}
						onBlur={validateJoinForm}
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
						onBlur={validateJoinForm}
						searchBtn={{ txt: "검색", fnc: addressPopup }}
					/>
					<JoinInput
						name="addressDetail"
						label="상세주소"
						placeholder="상세주소를 입력해주세요."
						value={joinForm.addressDetail}
						failMessage={joinFailAlert.addressDetail}
						onChange={changeJoinForm}
						onBlur={validateJoinForm}
						ref={(el) => {
							joinFormRefs.current.addressDetail = el;
						}}
					/>
					<JoinInput
						name="birthday"
						label="생년월일"
						placeholder="YYYY/MM/DD"
						value={joinForm.birthday}
						failMessage={joinFailAlert.birthday}
						onChange={changeJoinForm}
						onBlur={validateJoinForm}
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
						onChange={changeJoinForm}
						searchBtn={{
							txt: "인증",
							fnc: () => {
								clickPhoneAuth();
							},
						}}
						onBlur={validateJoinForm}
						ref={(el) => {
							joinFormRefs.current.phone = el;
						}}
						inputMode="numeric"
						pattern="[0-9]*"
						maxLength={11}
					/>
					{authNumberView && (
						<JoinInput
							name="phoneAuth"
							label="인증번호"
							placeholder="인증번호를 입력해주세요."
							value={joinForm.phoneAuth}
							failMessage={joinFailAlert.phoneAuth}
							successMessage={joinSuccessAlert.phoneAuth}
							onChange={changeJoinForm}
							searchBtn={{
								txt: "확인",
								fnc: () => {
									clickCheckPhoneAuth();
								},
							}}
							onBlur={validateJoinForm}
							ref={(el) => {
								joinFormRefs.current.phone = el;
							}}
							inputMode="numeric"
							pattern="[0-9]*"
							maxLength={6}
						/>
					)}
					<JoinInput
						name="email"
						label="이메일"
						placeholder="이메일을 입력해주세요."
						type="text"
						value={joinForm.email}
						failMessage={joinFailAlert.email}
						onChange={changeJoinForm}
						onBlur={validateJoinForm}
						ref={(el) => {
							joinFormRefs.current.email = el;
						}}
					/>
					<div className="submit-wrap">
						<input type="submit" value={"회원가입"} />
					</div>
				</form>
			</div>
		</main>
	);
}
