/* 내 정보 수정 */
"use client";

import API_URL from "@/api/endpoints";
import { postJson, putJson } from "@/api/fetchFilter";
import JoinInput from "@/components/user/JoinInput";
import useAuth from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useModalStore } from "@/store/modal.store";
import { ChangeEvent, FormEvent, UserInfo, UserUpdateResponse } from "@/types/auth";
import { BaseResponse } from "@/types/common";
import { useMutation } from "@tanstack/react-query";
import Error from "next/error";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

type UserUpdateForm = {
	phone: string;
	phoneAuth: string;
	email: string;
};
type UserUpdateFormRefs = {
	phone: HTMLInputElement | null;
	phoneAuth: HTMLInputElement | null;
	email: HTMLInputElement | null;
};

const initUpdateForm = {
	phone: "",
	phoneAuth: "",
	email: "",
};

const userUpdateFormRegex: { [key: string]: RegExp } = {
	phone: /^(010|011|016|017|018|019)\d{3,4}\d{4}$/,
	email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
};

const userUpdateFormRegexFailMent: { [key: string]: string } = {
	phone: "휴대폰 번호 형식에 일치하지 않습니다.",
	email: "이메일 형식에 일치하지 않습니다.",
};

export default function UserInfoUpdate() {
	const { replace } = useRouter();
	const { openModal } = useModalStore();
	const { user, setUser } = useAuth();
	useEffect(() => {
		if (user) {
			setUserUpdateForm((prev) => ({
				...prev,
				phone: user.phone,
				email: user.email,
			}));
		}
	}, [user]);
	/* ------------------------------------ */
	// 휴대폰 인증
	const handlePhoneAuth = useMutation({
		mutationFn: () => postJson<BaseResponse & { phoneAuthToken: string }>(getApiUrl(API_URL.AUTH_PHONE_AUTH), { phone: userUpdateForm.phone }),
		onSuccess(data) {
			setAuthNumberView(true);
			setPhoneAuthToken(data.phoneAuthToken);
			setPhoneAuthComplete(false);
			setUserUpdateFailAlert((prev) => ({
				...prev,
				phone: "",
				phoneAuth: "",
			}));
			setUserUpdateSuccessAlert((prev) => ({
				...prev,
				phone: "",
				phoneAuth: "인증 번호가 발송되었습니다. 제한시간 3분",
			}));
			setUserUpdateForm((prev) => ({
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
				phone: userUpdateForm.phone,
				phoneAuthToken,
				authNumber: userUpdateForm.phoneAuth,
			}),
		onSuccess(data) {
			setPhoneAuthComplete(true);
			setAuthNumberView(false);
			setUserUpdateFailAlert((prev) => ({
				...prev,
				phone: "",
				phoneAuth: "",
			}));
			setUserUpdateSuccessAlert((prev) => ({
				...prev,
				phone: "휴대폰 인증이 완료되었습니다.",
				phoneAuth: "",
			}));
		},
		onError(err) {
			console.log(err);
			if (["VERIFICATION_EXPIRED", "PHONEAUTH_TOKEN_UNAUTHORIZED"].includes(err.message)) {
				setUserUpdateFailAlert((prev) => ({
					...prev,
					phone: "인증시간이 만료되었습니다.",
				}));
				setAuthNumberView(false);
			}
			if (err.message === "INVALID_VERIFICATION_CODE") {
				setUserUpdateFailAlert((prev) => ({
					...prev,
					phoneAuth: "인증번호가 일치하지 않습니다.",
				}));
			}
		},
	});
	// 회원가입API
	const handleUserUpdate = useMutation<UserUpdateResponse, Error>({
		mutationFn: () =>
			putJson<UserUpdateResponse>(getApiUrl(API_URL.AUTH_JOIN), {
				phone: userUpdateForm.phone,
				email: userUpdateForm.email,
			}),
		onSuccess(data) {
			setUser((prev) => ({
				...prev,
				phone: data.phone,
				email: data.email,
			}));
			openModal("ALERT", {
				content: "내 정보 수정이 완료되었습니다.",
			});
			replace("/mypage/info");
		},
	});
	/* ------------------------------------ */
	// 유저업데이트 폼
	const [userUpdateForm, setUserUpdateForm] = useState<UserUpdateForm>(initUpdateForm);
	// 유저업데이트 실패 알람.
	const [userUpdateFailAlert, setUserUpdateFailAlert] = useState<UserUpdateForm>(initUpdateForm);
	// 유저업데이트 성공 알람.
	const [userUpdateSuccessAlert, setUserUpdateSuccessAlert] = useState<UserUpdateForm>(initUpdateForm);
	// 유저업데이트 input들 HTMLInputElement
	const userUpdateFormRefs = useRef<Partial<UserUpdateFormRefs>>({});
	// 인증번호 화면 띄울지
	const [authNumberView, setAuthNumberView] = useState<boolean>(false);
	// 인증번호 토큰
	const [phoneAuthToken, setPhoneAuthToken] = useState<string | null>(null);
	// 휴대폰인증완료여부
	const [phoneAuthComplete, setPhoneAuthComplete] = useState<boolean>(true);
	//
	// joinForm set
	const changeUserUpdateForm = (e: ChangeEvent) => {
		let { name, value } = e.target as {
			name: keyof UserUpdateForm;
			value: string;
		};
		let nextValue: string | number = value;

		if (name === "phone") {
			nextValue = value.replace(/[^0-9]/g, "").slice(0, 13); // 예: 13자리 인증번호
			setUserUpdateSuccessAlert((prev) => ({
				...prev,
				[name]: "",
			}));
		}
		if (name === "phoneAuth") {
			nextValue = value.replace(/[^0-9]/g, "").slice(0, 6); // 예: 6자리 인증번호
			setUserUpdateFailAlert((prev) => ({
				...prev,
				phone: "",
			}));
		}
		setUserUpdateForm((prev) => ({
			...prev,
			[name]: nextValue as UserUpdateForm[typeof name],
		}));
	};
	// 유효성 확인 ex) 아이디 중복확인, 정규표현식 확인
	const validateUserUpdateForm = async (e: ChangeEvent) => {
		let { name, value } = e.target as {
			name: keyof UserUpdateForm;
			value: string;
		};
		value = value.trim();
		let failMent = "";
		let successMent = "";
		const addFailMentObj: { [key: string]: string } = {};
		if (userUpdateFormRegex[name]) {
			if (!userUpdateFormRegex[name].test(value)) {
				failMent = userUpdateFormRegexFailMent[name];
			}
		}
		if (!value) {
			failMent = "";
			successMent = "";
		} else if (!failMent) {
			if (name == "phone") {
				if (userUpdateSuccessAlert.phone) {
					successMent = userUpdateSuccessAlert.phone;
				}
				if (value !== user?.phone) setPhoneAuthComplete(false);
				else {
					setPhoneAuthComplete(true);
				}
			} else if (name === "phoneAuth") {
				if (value.length < 6) {
					failMent = "인증번호 6자리를 입력해주세요.";
				}
			}
		}
		setUserUpdateForm((prev) => ({
			...prev,
			[name]: value,
		}));
		setUserUpdateFailAlert((prev) => ({
			...prev,
			[name]: failMent,
			...addFailMentObj,
		}));
		setUserUpdateSuccessAlert((prev) => ({
			...prev,
			[name]: successMent,
		}));
	};
	/* ------------------------------------ */
	// 휴대폰 인증 보내기 버튼
	const clickPhoneAuth = () => {
		if (!userUpdateForm.phone) {
			setUserUpdateFailAlert((prev) => ({
				...prev,
				phone: "휴대폰 번호를 입력해주세요.",
			}));
			userUpdateFormRefs.current.phone?.focus();
			return;
		}
		if (userUpdateFormRegex.phone) {
			if (!userUpdateFormRegex.phone.test(userUpdateForm.phone)) {
				setUserUpdateFailAlert((prev) => ({
					...prev,
					phone: userUpdateFormRegexFailMent.phone,
				}));
				userUpdateFormRefs.current.phone?.focus();
				return;
			}
		}
		handlePhoneAuth.mutate();
	};
	// 휴대폰 인증확인 버튼
	const clickCheckPhoneAuth = () => {
		if (userUpdateFailAlert.phoneAuth) {
			userUpdateFormRefs.current.phoneAuth?.focus();
			return;
		}
		handlePhoneAuthComplete.mutate();
	};
	// 유저업데이트 완료
	const userUpdateSubmit = (e: FormEvent) => {
		console.log("userUpdateSubmit");
		e.preventDefault();
		console.log("phoneAuthComplete", phoneAuthComplete);
		/*  */
		if (userUpdateForm.phone === user?.phone && userUpdateForm.email === user?.email) {
			replace("/mypage/info");
			return;
		}
		/*  */
		let alertOn = "";
		const alertKeys = Object.keys(userUpdateFailAlert).filter((v) => v !== "phoneAuth") as (keyof UserUpdateForm)[];
		for (const key of alertKeys) {
			// for (let i = 0; i < keys.length; i++) {
			// const key = keys[i];
			const value = userUpdateForm[key];
			alertOn = userUpdateFailAlert[key];
			// 알람없을 때 처음 누를 때
			if (!alertOn) {
				if (!value) {
					alertOn = "해당 내용을 입력해주세요.";
				} else if (key == "phone" && !phoneAuthComplete) {
					alertOn = "휴대폰 인증이 필요합니다.";
				}
			}
			// 알람있을 때 또 눌렀으면
			if (alertOn) {
				setUserUpdateFailAlert((prev) => ({
					...prev,
					[key]: alertOn,
				}));
				userUpdateFormRefs.current[key]?.focus();
				break;
			}
		}
		if (alertOn) return;
		console.log("내 정보 변경");
		handleUserUpdate.mutate();
	};

	if (!user) return null;
	return (
		<main id="myPageInfo" className="user-info">
			<div id="userInfo" className="form-wrap update">
				<form onSubmit={userUpdateSubmit}>
					<h2>내 정보 수정</h2>
					<div className="join-input mark">
						<div className="join-label">
							<label>아이디</label>
						</div>
						<div className={`join-text`}>
							<div className="info-val">
								<span>{user.userId}</span>
							</div>
						</div>
					</div>
					<JoinInput
						name="phone"
						label="휴대폰"
						placeholder="휴대폰번호를 입력해주세요."
						type="tel"
						value={userUpdateForm.phone}
						failMessage={userUpdateFailAlert.phone}
						successMessage={userUpdateSuccessAlert.phone}
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
							userUpdateFormRefs.current.phone = el;
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
							value={userUpdateForm.phoneAuth}
							failMessage={userUpdateFailAlert.phoneAuth}
							successMessage={userUpdateSuccessAlert.phoneAuth}
							onChange={changeUserUpdateForm}
							searchBtn={{
								txt: "확인",
								fnc: () => {
									clickCheckPhoneAuth();
								},
							}}
							onBlur={validateUserUpdateForm}
							ref={(el) => {
								userUpdateFormRefs.current.phone = el;
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
						value={userUpdateForm.email}
						failMessage={userUpdateFailAlert.email}
						onChange={changeUserUpdateForm}
						onBlur={validateUserUpdateForm}
						ref={(el) => {
							userUpdateFormRefs.current.email = el;
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
