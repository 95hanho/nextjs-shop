import API_URL from "@/api/endpoints";
import { getNormal, putJson } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useModalStore } from "@/store/modal.store";
import { BaseResponse } from "@/types/common";
import { ChangeEvent, FormEvent } from "@/types/event";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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

const initPasswordChangeAlert: PasswordChangeForm = {
	curPassword: "",
	newPassword: "",
	newPasswordCheck: "",
};

type PasswordChangeAlarm = {
	name: keyof PasswordChangeForm;
	message: string;
	status?: "SUCCESS" | "FAIL";
};

const passwordRegex: RegExp = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,20}$/;
const passwordRegexFailMent: string = "영문, 숫자, 특수문자 각각 1개이상 포함하는 8자이상 20자 이하 조합";

//
interface usePasswordChangeFormProps {
	mode: "LOGGED_IN" | "RESET";
}

export function usePasswordChangeForm({ mode }: usePasswordChangeFormProps) {
	const router = useRouter();
	const { openModal } = useModalStore();

	/* --------- */

	// 비밀번호 변경
	const handlePasswordChange = useMutation({
		mutationFn: () =>
			putJson<BaseResponse>(getApiUrl(API_URL.AUTH_PASSWORD), {
				...pwdChangeForm,
			}),
		onSuccess(data) {
			openModal("ALERT", {
				content: `비밀번호가 변경되었습니다.`,
			});
			if (mode === "LOGGED_IN") router.replace("/mypage/info");
			if (mode === "RESET") router.replace("/user");
		},
		onError(err) {
			console.log(err);
			if (err.message === "PWDRESET_UNAUTHORIZED") {
				openModal("ALERT", {
					content: `인증이 만료되었습니다.${mode === "RESET" ? "다시 비밀번호 찾기 인증을 진행해주세요." : ""}`,
				});
				if (mode === "LOGGED_IN") router.replace("/mypage/info");
				if (mode === "RESET") router.replace("/user/find/password");
			}
			if (err.message === "CURRENT_PASSWORD_MISMATCH") {
				openModal("ALERT", {
					content: `현재 비밀번호가 일치하지 않습니다.`,
				});
				pwdChangeFormRefs.current.curPassword?.focus();
			}
			if (err.message === "CURRENT_PASSWORD_EQUAL") {
				openModal("ALERT", {
					content: `기존 비밀번호와 다른 비밀번호를 입력해주세요.`,
				});
				setPwdChangeForm((prev) => ({
					...prev,
					newPasswordCheck: "",
				}));
				pwdChangeFormRefs.current.newPassword?.focus();
			}
		},
	});

	/* --------- */
	// 페이지 오픈 시 토큰 확인
	useEffect(() => {
		if (!mode || !router) return;
		getNormal(getApiUrl(mode === "LOGGED_IN" ? API_URL.AUTH_TOKEN_CHECK : API_URL.AUTH_TOKEN_CHECK_PASSWORD))
			.then((res) => {
				console.log(res);
			})
			.catch((err) => {
				console.log(err);
				if (err.message === "REFRESH_UNAUTHORIZED") {
					openModal("ALERT", {
						content: "로그인이 만료되었습니다. 다시 로그인 해주세요.",
					});
					router.replace("/user?next=/mypage/info");
				}
				if (err.message === "PWDRESET_UNAUTHORIZED") {
					openModal("ALERT", {
						content: `인증이 만료되었습니다.${mode === "RESET" ? "다시 비밀번호 찾기 인증을 진행해주세요." : ""}`,
					});
					if (mode === "LOGGED_IN") router.replace("/mypage/info");
					if (mode === "RESET") router.replace("/user/find/password");
				}
			});
	}, [mode, router]);

	/* --------- */

	// 비번변경 폼 데이터
	const [pwdChangeForm, setPwdChangeForm] = useState<PasswordChangeForm>(initPasswordChangeForm);
	// 비번변경 알람
	const [pwdChangeAlarm, setPwdChangeAlarm] = useState<PasswordChangeAlarm | null>(null);

	// 비번변경 실패 알람.
	const [pwdChangeFailAlert, setPwdChangeFailAlert] = useState<PasswordChangeForm>(initPasswordChangeAlert);
	// 비번변경 성공 알람.
	const [pwdChangeSuccessAlert, setPwdChangeSuccessAlert] = useState<PasswordChangeForm>(initPasswordChangeAlert);
	// 비번변경 input들 HTMLInputElement
	const pwdChangeFormRefs = useRef<Partial<PasswordChangeFormRefs>>({});
	// 비번변경 폼 변경
	const changePwdChangeForm = (e: ChangeEvent) => {
		const { name, value } = e.target as {
			name: keyof PasswordChangeForm;
			value: string;
		};

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
	const validatePwdChangeForm = async (e: ChangeEvent) => {
		let { name, value } = e.target as {
			name: keyof PasswordChangeForm;
			value: string;
		};
		value = value.trim();
		let failMent = "";
		const successMent = "";
		const addFailMentObj: Partial<Record<keyof PasswordChangeForm, string>> = {};
		if (name === "newPassword" && value && !passwordRegex.test(value)) {
			failMent = passwordRegexFailMent;
		} else if (["curPassword", "newPassword"].includes(name) && value && pwdChangeForm.curPassword === pwdChangeForm.newPassword) {
			addFailMentObj["newPassword"] = "현재비밀번호와 같습니다.";
		} else if (["newPassword", "newPasswordCheck"].includes(name) && value && pwdChangeForm.newPassword !== pwdChangeForm.newPasswordCheck) {
			addFailMentObj["newPasswordCheck"] = "새로운 비밀번호와 일치하지 않습니다.";
		}
		setPwdChangeForm((prev) => ({
			...prev,
			[name]: value,
		}));
		setPwdChangeFailAlert((prev) => ({
			...prev,
			[name]: failMent,
			...addFailMentObj,
		}));
		setPwdChangeSuccessAlert((prev) => ({
			...prev,
			[name]: successMent,
		}));
	};
	// 비밀번호변경 실행
	const pwdChangeSubmit = (e: FormEvent) => {
		console.log("pwdChangeSubmit");
		e.preventDefault();
		let alertOn = "";
		const alertKeys = Object.keys(pwdChangeFailAlert).filter((v) => v !== "curPassword") as (keyof PasswordChangeForm)[];
		for (const key of alertKeys) {
			const value = pwdChangeForm[key];
			alertOn = pwdChangeFailAlert[key];
			// 알람없을 때 처음 누를 때
			if (!alertOn) {
				if (!value) {
					alertOn = "해당 내용을 입력해주세요.";
				}
			}
			// 알람있을 때 또 눌렀으면
			if (alertOn) {
				setPwdChangeFailAlert((prev) => ({
					...prev,
					[key]: alertOn,
				}));
				pwdChangeFormRefs.current[key]?.focus();
				break;
			}
		}
		if (alertOn) return;
		//
		console.log("pwdChangeSubmi2222t");
		handlePasswordChange.mutate();
	};

	return {
		pwdChangeSubmit,
		pwdChangeForm,
		pwdChangeAlarm,
		changePwdChangeForm,
		validatePwdChangeForm,
		pwdChangeFormRefs,
	};
}
