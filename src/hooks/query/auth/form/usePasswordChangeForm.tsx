import API_URL from "@/api/endpoints";
import { getNormal, putJson } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useModalStore } from "@/store/modal.store";
import { BaseResponse } from "@/types/common";
import { ChangeEvent, FormEvent } from "@/types/event";
import { FormInputAlarm, FormInputRefs } from "@/types/form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type PasswordChangeForm = {
	curPassword: string;
	newPassword: string;
	newPasswordCheck: string;
};
type PasswordChangeFormInputKeys = keyof PasswordChangeForm;
type PasswordChangeAlarm = FormInputAlarm<PasswordChangeFormInputKeys>;
type PasswordChangeFormInputRefs = FormInputRefs<PasswordChangeFormInputKeys>;

const initPasswordChangeForm: PasswordChangeForm = {
	curPassword: "",
	newPassword: "",
	newPasswordCheck: "",
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
		onSuccess() {
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
				pwdChangeFormInputRefs.current.curPassword?.focus();
			}
			if (err.message === "CURRENT_PASSWORD_EQUAL") {
				openModal("ALERT", {
					content: `기존 비밀번호와 다른 비밀번호를 입력해주세요.`,
				});
				setPwdChangeForm((prev) => ({
					...prev,
					newPasswordCheck: "",
				}));
				pwdChangeFormInputRefs.current.newPassword?.focus();
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
	}, [mode, router, openModal]);

	/* --------- */

	// 비번변경 폼 데이터
	const [pwdChangeForm, setPwdChangeForm] = useState<PasswordChangeForm>(initPasswordChangeForm);
	// 비번변경 알람
	const [pwdChangeAlarm, setPwdChangeAlarm] = useState<PasswordChangeAlarm | null>(null);
	// 비번변경 input들 HTMLInputElement
	const pwdChangeFormInputRefs = useRef<Partial<PasswordChangeFormInputRefs>>({});
	// 비번변경 폼 변경
	const changePwdChangeForm = (e: ChangeEvent) => {
		const { name, value } = e.target as {
			name: PasswordChangeFormInputKeys;
			value: string;
		};

		if (name == "newPasswordCheck") {
			if (pwdChangeForm.newPassword && pwdChangeForm.newPasswordCheck != value) {
				setPwdChangeAlarm({
					name,
					message: "비밀번호와 일치하지 않습니다.",
					status: "FAIL",
				});
			}
		}
		setPwdChangeForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};
	// 유효성 확인 ex) 아이디 중복확인, 정규표현식 확인
	const validatePwdChangeForm = async (e: ChangeEvent) => {
		const { name, value } = e.target as {
			name: PasswordChangeFormInputKeys;
			value: string;
		};
		const changeVal = value.trim();
		let changeAlarm: PasswordChangeAlarm | null = null;
		if (name === "newPassword" && changeVal && !passwordRegex.test(changeVal)) {
			changeAlarm = { name, message: passwordRegexFailMent, status: "FAIL" };
		} else if (["curPassword", "newPassword"].includes(name) && changeVal && pwdChangeForm.curPassword === pwdChangeForm.newPassword) {
			changeAlarm = { name: "newPassword", message: "현재비밀번호와 같습니다.", status: "FAIL" };
		} else if (["newPassword", "newPasswordCheck"].includes(name) && changeVal && pwdChangeForm.newPassword !== pwdChangeForm.newPasswordCheck) {
			changeAlarm = { name: "newPasswordCheck", message: "새로운 비밀번호와 일치하지 않습니다.", status: "FAIL" };
		}
		setPwdChangeAlarm(changeAlarm);
		setPwdChangeForm((prev) => ({
			...prev,
			[name]: changeVal,
		}));
	};
	// 비밀번호변경 실행
	const pwdChangeSubmit = (e: FormEvent) => {
		console.log("pwdChangeSubmit");
		e.preventDefault();
		if (pwdChangeAlarm?.status === "FAIL") {
			pwdChangeFormInputRefs.current[pwdChangeAlarm.name]?.focus();
		}
		let changeAlarm: PasswordChangeAlarm | null = null;
		const alertKeys = Object.keys(pwdChangeForm).filter((v) => v !== "curPassword") as PasswordChangeFormInputKeys[];
		for (const key of alertKeys) {
			const value = pwdChangeForm[key];
			// 알람없을 때 처음 누를 때
			if (!value) {
				changeAlarm = { name: key, message: "해당 내용을 입력해주세요.", status: "FAIL" };
				pwdChangeFormInputRefs.current[key]?.focus();
			}
		}
		if (changeAlarm) {
			setPwdChangeAlarm(changeAlarm);
			return;
		}
		//
		console.log("pwdChangeSubmit");
		handlePasswordChange.mutate();
	};

	return {
		pwdChangeSubmit,
		pwdChangeForm,
		pwdChangeAlarm,
		changePwdChangeForm,
		validatePwdChangeForm,
		pwdChangeFormInputRefs,
	};
}
