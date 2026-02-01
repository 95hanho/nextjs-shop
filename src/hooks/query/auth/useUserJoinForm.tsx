"use client";

import { useRef, useState } from "react";
import { isValidDateString } from "@/utils/ui";
import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/api/fetchFilter";
import { BaseResponse } from "@/types/common";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { JoinFormAlert, JoinFormInputKeys, JoinRequest, LoginFormData, PhoneAuthCheckRequest, PhoneAuthRequest, User } from "@/types/auth";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent } from "@/types/event";

export interface JoinForm extends LoginFormData, User {
	phoneAuth: string;
	passwordCheck: string;
}

export type JoinFormRefs = {
	[K in JoinFormInputKeys]: HTMLInputElement | null;
};

const initJoinForm: JoinForm = {
	userId: "",
	password: "",
	passwordCheck: "",
	name: "",
	zonecode: "",
	address: "",
	addressDetail: "",
	birthday: "",
	phone: "",
	phoneAuth: "",
	email: "",
};
const testJoinForm: JoinForm = {
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

export function useUserJoinForm() {
	const router = useRouter();

	// 회원가입 폼 데이터
	const [joinForm, setJoinForm] = useState<JoinForm>(testJoinForm);
	// 회원가입 알람.
	const [joinAlarm, setJoinAlarm] = useState<JoinFormAlert | null>(null);
	const changeJoinAlarm = (name: JoinFormInputKeys, message: string, status: "SUCCESS" | "FAIL" = "SUCCESS") => {
		setJoinAlarm({ name, message, status });
	};
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
		mutationFn: (userId: string) => postJson<BaseResponse>(getApiUrl(API_URL.AUTH_ID), { userId }),
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
		// onSettled(a, b) {},
	});
	// 휴대폰 인증
	const handlePhoneAuth = useMutation({
		mutationFn: () =>
			postJson<BaseResponse & { phoneAuthToken: string }, PhoneAuthRequest>(getApiUrl(API_URL.AUTH_PHONE_AUTH), {
				phone: joinForm.phone,
				mode: "JOIN",
			}),
		onSuccess(data) {
			setAuthNumberView(true);
			setPhoneAuthToken(data.phoneAuthToken);
			setPhoneAuthComplete(false);
			changeJoinAlarm("phoneAuth", "인증 번호가 발송되었습니다. 제한시간 3분");
			setJoinForm((prev) => ({
				...prev,
				phoneAuth: "",
			}));
		},
		onError(err) {
			console.log(err);
			if (err.message === "PHONE_DUPLICATED") {
				changeJoinAlarm("phone", "이미 존재하는 번호입니다.", "FAIL");
			}
		},
	});
	// 휴대폰 인증 확인
	const handlePhoneAuthComplete = useMutation({
		mutationFn: async () => {
			if (!phoneAuthToken) {
				// 인증을 다시 해야한다는 동작
				return;
			}
			return postJson<BaseResponse, PhoneAuthCheckRequest>(getApiUrl(API_URL.AUTH_PHONE_AUTH_CHECK), {
				phoneAuthToken,
				authNumber: joinForm.phoneAuth,
			});
		},
		onSuccess() {
			setPhoneAuthComplete(true);
			setAuthNumberView(false);
			changeJoinAlarm("phone", "휴대폰 인증이 완료되었습니다.");
		},
		onError(err) {
			console.log(err);
			if (["VERIFICATION_EXPIRED", "PHONEAUTH_TOKEN_UNAUTHORIZED"].includes(err.message)) {
				changeJoinAlarm("phone", "인증시간이 만료되었습니다.", "FAIL");
				setAuthNumberView(false);
			}
			if (err.message === "INVALID_VERIFICATION_CODE") {
				changeJoinAlarm("phone", "인증번호가 일치하지 않습니다.", "FAIL");
			}
		},
	});
	// 회원가입
	const handleRegister = useMutation({
		mutationFn: () => postJson<BaseResponse, JoinRequest>(getApiUrl(API_URL.AUTH_JOIN), { ...joinForm }),
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
				changeJoinAlarm("phone", "인증시간이 만료되었습니다. 다시 인증해주세요.", "FAIL");
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
		let nextAlarm: JoinFormAlert | null = null;

		if (name == "passwordCheck") {
			if (joinForm.password && joinForm.password != value) {
				nextAlarm = { name: "passwordCheck", message: "비밀번호와 일치하지 않습니다.", status: "FAIL" };
			}
		}
		if (name === "phone") {
			nextValue = value.replace(/[^0-9]/g, "").slice(0, 13); // 예: 13자리 인증번호
			setAuthNumberView(false);
			setPhoneAuthComplete(false);
		}
		if (name === "phoneAuth") {
			nextValue = value.replace(/[^0-9]/g, "").slice(0, 6); // 예: 6자리 인증번호
		}
		setJoinAlarm(nextAlarm);
		setJoinForm((prev) => ({
			...prev,
			[name]: nextValue as JoinForm[typeof name],
		}));
	};
	// 유효성 확인 ex) 아이디 중복확인, 정규표현식 확인
	const validateJoinForm = async (e: ChangeEvent) => {
		const { name, value } = e.target as {
			name: JoinFormInputKeys;
			value: string;
		};
		let changeVal = value.trim();
		let changeAlarm: JoinFormAlert | null = null;
		if (changeVal) {
			if (joinFormRegex[name] && !joinFormRegex[name].test(changeVal)) {
				changeAlarm = { name, message: joinFormRegexFailMent[name], status: "FAIL" };
			} else {
				if (name == "userId") {
					try {
						await handleIdDuplcheck.mutateAsync(joinForm.userId);
						changeAlarm = { name, message: "사용가능한 아이디입니다." };
						setIdDuplCheck(true);
					} catch (err: any) {
						if (err.message === "ID_DUPLICATED") {
							changeAlarm = { name, message: "중복된 아이디가 존재합니다.", status: "FAIL" };
							setIdDuplCheck(false);
						}
					}
				} else if (name == "password") {
					if (joinForm.passwordCheck && joinForm.passwordCheck != changeVal) {
						changeAlarm = { name: "passwordCheck", message: "비밀번호와 일치하지 않습니다.", status: "FAIL" };
					}
				} else if (name == "passwordCheck") {
					if (joinForm.password && joinForm.password != changeVal) {
						changeAlarm = { name, message: "비밀번호와 일치하지 않습니다.", status: "FAIL" };
					}
				} else if (name == "birthday") {
					const numericValue = changeVal.replace(/[^0-9]/g, ""); // 숫자가 아닌 문자는 제거
					if (!isValidDateString(numericValue)) {
						changeAlarm = { name, message: joinFormRegexFailMent[name], status: "FAIL" };
					} else {
						changeVal = numericValue.slice(0, 4) + "/" + numericValue.slice(4, 6) + "/" + numericValue.slice(6, 8);
					}
				} else if (name == "phone") {
					// if (joinSuccessAlert.phone) {
					// 	successMent = joinSuccessAlert.phone;
					// }
					// if (joinFailAlert.phone == "휴대폰 인증이 필요합니다.") {
					// 	failMent = joinFailAlert.phone;
					// }
				} else if (name === "phoneAuth") {
					if (changeVal.length < 6) {
						changeAlarm = { name, message: "인증번호 6자리를 입력해주세요.", status: "FAIL" };
					}
				}
			}
		}
		setJoinAlarm(changeAlarm);
		setJoinForm((prev) => ({
			...prev,
			[name]: changeVal,
		}));
	};
	// 회원가입 완료
	const joinSubmit = (e: FormEvent) => {
		console.log("joinSubmit");
		e.preventDefault();
		// const keys = Object.keys(joinForm) as (keyof JoinForm)[];
		if (joinAlarm?.status === "FAIL") {
			joinFormRefs.current[joinAlarm.name]?.focus();
			return;
		}
		let changeAlarm: JoinFormAlert | null = null;
		const alertKeys = Object.keys(joinForm) as JoinFormInputKeys[];
		for (const key of alertKeys) {
			const value = joinForm[key];
			// 알람없을 때 처음 누를 때
			if (!value && joinFormRefs.current[key]) {
				changeAlarm = { name: key, message: "해당 내용을 입력해주세요.", status: "FAIL" };
				joinFormRefs.current[key]?.focus();
			} else if (key == "userId" && !idDuplCheck) {
				changeAlarm = { name: key, message: "아이디 중복확인을 해주세요.", status: "FAIL" };
			} else if (key == "phone" && !phoneAuthComplete) {
				changeAlarm = { name: key, message: "휴대폰 인증이 필요합니다.", status: "FAIL" };
			}
			if (changeAlarm) break;
		}
		if (changeAlarm) {
			setJoinAlarm(changeAlarm);
			return;
		}
		// 회원가입 로직 추가
		console.log("회원가입 완료");
		handleRegister.mutate();
	};

	// 휴대폰 인증 보내기 버튼
	const clickPhoneAuth = () => {
		if (!joinForm.phone) {
			changeJoinAlarm("phone", "휴대폰 번호를 입력해주세요.", "FAIL");
			joinFormRefs.current.phone?.focus();
			return;
		}
		if (joinFormRegex.phone) {
			if (!joinFormRegex.phone.test(joinForm.phone)) {
				changeJoinAlarm("phone", joinFormRegexFailMent.phone, "FAIL");
				joinFormRefs.current.phone?.focus();
				return;
			}
		}
		handlePhoneAuth.mutate();
	};
	// 휴대폰 인증확인 버튼
	const clickCheckPhoneAuth = () => {
		if (joinAlarm?.name === "phone" && joinAlarm.status === "FAIL") {
			joinFormRefs.current.phoneAuth?.focus();
			return;
		}
		handlePhoneAuthComplete.mutate();
	};

	return {
		joinSubmit,
		joinForm,
		setJoinForm,
		joinAlarm,
		joinFormRefs,
		changeJoinForm,
		validateJoinForm,
		clickPhoneAuth,
		authNumberView,
		clickCheckPhoneAuth,
	};
}
