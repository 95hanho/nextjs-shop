import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { ChangeEvent, FormEvent } from "@/types/event";
import { useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type FindType = "id" | "password";

type FindUserForm = {
	userId: string;
	phone: string;
	phoneAuth: string;
};
type FindUserFormAlarm = {
	name: keyof FindUserForm;
	message: string;
	status?: "SUCCESS" | "FAIL";
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

export function useFindUserForm() {
	const { push } = useRouter();
	const params = useParams<{ type?: FindType }>(); // `type`이 있을 수도 있고 없을 수도 있음
	const findType = params.type;

	/*  */

	useEffect(() => {
		if (!findType || !["id", "password"].includes(findType)) {
			push("/user");
		}
	}, []);

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
			setFindUserFormAlarm({
				name: "phoneAuth",
				message: "인증 번호가 발송되었습니다. 제한시간 3분",
			});
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
				setFindUserFormAlarm({
					name: "phone",
					message: "인증시간이 만료되었습니다.",
					status: "FAIL",
				});
				setAuthNumberView(false);
			}
			if (err.message === "INVALID_VERIFICATION_CODE") {
				setFindUserFormAlarm({
					name: "phoneAuth",
					message: "인증번호가 일치하지 않습니다.",
					status: "FAIL",
				});
			}
		},
	});

	/*  */
	// 비번변경 폼 데이터
	const [findUserForm, setFindUserForm] = useState<FindUserForm>(initFindUserForm);
	const [findUserFormAlarm, setFindUserFormAlarm] = useState<FindUserFormAlarm | null>(null);
	// 비번변경 input들 HTMLInputElement
	const findUserFormRefs = useRef<Partial<FindUserFormRefs>>({});
	// 인증번호 화면 띄울지
	const [phoneAuthView, setAuthNumberView] = useState<boolean>(false);
	// 인증번호 토큰
	const [phoneAuthToken, setPhoneAuthToken] = useState<string | null>(null);
	// 인증번호 인증완료
	const [phoneAuthComplete, setPhoneAuthComplete] = useState<boolean>(false);
	// 찾은 아이디
	const [findId, setFindId] = useState<string>("userId");

	// 비번변경 폼 변경
	const changeFindUserForm = (e: ChangeEvent) => {
		const { name, value } = e.target as {
			name: keyof FindUserForm;
			value: string;
		};
		let nextValue: string | number = value;

		if (name === "phone") {
			nextValue = value.replace(/[^0-9]/g, "").slice(0, 13); // 예: 13자리 인증번호
			setPhoneAuthComplete(false);
			// setFindUserSuccessAlert((prev) => ({
			// 	...prev,
			// 	[name]: "",
			// }));
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
		const { name, value } = e.target as {
			name: keyof FindUserForm;
			value: string;
		};
		const changeVal = value.trim();
		let changeAlarm: FindUserFormAlarm | null = null;
		if (name === "phone") {
			if (changeVal && !phoneRegex.test(changeVal)) {
				changeAlarm = { name: "phone", message: phoneRegexFailMent, status: "FAIL" };
			}
		} else if (name === "phoneAuth") {
			if (changeVal.length < 6) {
				changeAlarm = { name: "phoneAuth", message: "인증번호 6자리를 입력해주세요.", status: "FAIL" };
			}
		}
		setFindUserFormAlarm(changeAlarm);
		setFindUserForm((prev) => ({
			...prev,
			[name]: changeVal,
		}));
	};
	// 비밀번호변경 제출
	const findUserSubmit = (e: FormEvent) => {
		console.log("findUserSubmit");
		e.preventDefault();
		if (findUserFormAlarm?.status === "FAIL") {
			findUserFormRefs.current[findUserFormAlarm.name]?.focus();
		}
		let changeAlarm: FindUserFormAlarm | null = null;
		const alertKeys = Object.keys(findUserForm) as (keyof FindUserForm)[];
		for (const key of alertKeys) {
			if (!findUserFormRefs.current[key]) continue;
			const value = findUserForm[key];

			// 알람없을 때 처음 누를 때
			if (!value) {
				changeAlarm = { name: key, message: "해당 내용을 입력해주세요.", status: "FAIL" };
				findUserFormRefs.current[key]?.focus();
			}
		}
		if (changeAlarm) {
			setFindUserFormAlarm(changeAlarm);
			return;
		}
		//
		console.log("비밀번호변경 제출");
	};

	// ---------------------

	// 휴대폰 인증 보내기 버튼
	const clickPhoneAuth = () => {
		if (!findUserForm.phone) {
			setFindUserFormAlarm({
				name: "phone",
				message: "휴대폰 번호를 입력해주세요.",
				status: "FAIL",
			});
			findUserFormRefs.current.phone?.focus();
			return;
		}
		if (findUserFormAlarm?.name === "phone") {
			findUserFormRefs.current.phone?.focus();
			return;
		}
		handlePhoneAuth.mutate();
	};
	// 휴대폰 인증확인 버튼
	const clickCheckPhoneAuth = () => {
		if (findUserFormAlarm?.name === "phoneAuth") {
			findUserFormRefs.current.phoneAuth?.focus();
			return;
		}
		handlePhoneAuthComplete.mutate();
	};

	return {
		findType,
		phoneAuthComplete,
		findUserSubmit,
		findUserForm,
		findUserFormAlarm,
		changeFindUserForm,
		validatefindUserForm,
		findUserFormRefs,
		clickPhoneAuth,
		phoneAuthView,
		clickCheckPhoneAuth,
		findId,
	};
}
