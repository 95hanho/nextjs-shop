import API_URL from "@/api/endpoints";
import { getNormal, postJson, putJson } from "@/api/fetchFilter";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useModalStore } from "@/store/modal.store";
import { PhoneAuthRequest, UserUpdateRequest } from "@/types/auth";
import { BaseResponse } from "@/types/common";
import { ChangeEvent, FormEvent } from "@/types/event";
import { FormInputAlarm, FormInputRefs } from "@/types/form";
import { useMutation, useQuery } from "@tanstack/react-query";
import Error from "next/error";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type UserUpdateForm = {
	zonecode: string;
	address: string;
	addressDetail: string;
	phone: string;
	phoneAuth: string;
	email: string;
};
type UserUpdateFormInputKeys = keyof Omit<UserUpdateForm, "zonecode">;
type UserUpdateAlarm = FormInputAlarm<UserUpdateFormInputKeys>;
type UserUpdateFormInputRefs = FormInputRefs<UserUpdateFormInputKeys>;

const initUpdateForm = {
	zonecode: "",
	address: "",
	addressDetail: "",
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

export function useUserUpdateForm() {
	const { replace } = useRouter();
	const { openModal } = useModalStore();
	const { user, setUser, loginOn } = useAuth();
	useEffect(() => {
		if (user.name) {
			setUserUpdateForm((prev) => ({
				...prev,
				zonecode: user.zonecode,
				address: user.address,
				addressDetail: user.addressDetail,
				phone: user.phone,
				email: user.email,
			}));
		}
	}, [user]);
	/* ------------------------------------ */
	// 회원아이디 조회
	const { data: userIdData } = useQuery<BaseResponse & { userId: string }>({
		queryKey: ["wishList"],
		queryFn: () => getNormal(getApiUrl(API_URL.AUTH_ID)),
		enabled: loginOn,
		refetchOnWindowFocus: false,
		select: (data) => {
			return data;
		},
	});
	// 휴대폰 인증
	const handlePhoneAuth = useMutation({
		mutationFn: () =>
			postJson<BaseResponse & { phoneAuthToken: string }, PhoneAuthRequest>(
				getApiUrl(API_URL.AUTH_PHONE_AUTH),
				{ phone: userUpdateForm.phone, mode: "CHANGE" },
				{
					["x-auth-mode"]: "required",
				},
			),
		onSuccess(data) {
			setPhoneAuthView(true);
			setPhoneAuthToken(data.phoneAuthToken);
			setPhoneAuthComplete(false);
			setUserUpdateAlarm({
				name: "phoneAuth",
				message: "인증 번호가 발송되었습니다. 제한시간 3분",
			});
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
		onSuccess() {
			setPhoneAuthComplete(true);
			setPhoneAuthView(false);
			setUserUpdateAlarm({
				name: "phone",
				message: "휴대폰 인증이 완료되었습니다.",
			});
		},
		onError(err) {
			console.log(err);
			if (["VERIFICATION_EXPIRED", "PHONEAUTH_TOKEN_UNAUTHORIZED"].includes(err.message)) {
				setUserUpdateAlarm({
					name: "phone",
					message: "인증시간이 만료되었습니다.",
					status: "FAIL",
				});
				setPhoneAuthView(false);
			}
			if (err.message === "INVALID_VERIFICATION_CODE") {
				setUserUpdateAlarm({
					name: "phoneAuth",
					message: "인증번호가 일치하지 않습니다.",
					status: "FAIL",
				});
			}
		},
	});
	// 회원정보변경 API
	const handleUserUpdate = useMutation<BaseResponse, Error>({
		mutationFn: () =>
			putJson<BaseResponse, UserUpdateRequest>(getApiUrl(API_URL.AUTH_JOIN), {
				...userUpdateForm,
			}),
		onSuccess() {
			/* --------
			유저주소지에 일치하는 것이 없으면 주소지 변경하겠냐고 물어보고 보내주기
			-----*/
			//
			setUser((prev) => ({
				...prev,
				phone: userUpdateForm.phone,
				email: userUpdateForm.email,
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
	// 유저업데이트 알람
	const [userUpdateAlarm, setUserUpdateAlarm] = useState<UserUpdateAlarm | null>(null);
	// 유저업데이트 input들 HTMLInputElement
	const userUpdateFormInputRefs = useRef<Partial<UserUpdateFormInputRefs>>({});
	// 인증번호 화면 띄울지
	const [phoneAuthView, setPhoneAuthView] = useState<boolean>(false);
	// 인증번호 토큰
	const [phoneAuthToken, setPhoneAuthToken] = useState<string | null>(null);
	// 휴대폰인증완료여부
	const [phoneAuthComplete, setPhoneAuthComplete] = useState<boolean>(true);
	//
	// joinForm set
	const changeUserUpdateForm = (e: ChangeEvent) => {
		const { name, value } = e.target as {
			name: UserUpdateFormInputKeys;
			value: string;
		};
		let changeValue: string | number = value;

		if (name === "phone") {
			changeValue = value.replace(/[^0-9]/g, "").slice(0, 13); // 예: 13자리 인증번호
		}
		if (name === "phoneAuth") {
			changeValue = value.replace(/[^0-9]/g, "").slice(0, 6); // 예: 6자리 인증번호
		}
		setUserUpdateAlarm(null);
		setUserUpdateForm((prev) => ({
			...prev,
			[name]: changeValue as UserUpdateForm[typeof name],
		}));
	};
	// 유효성 확인 ex) 아이디 중복확인, 정규표현식 확인
	const validateUserUpdateForm = async (e: ChangeEvent) => {
		const { name, value } = e.target as {
			name: UserUpdateFormInputKeys;
			value: string;
		};
		const changeVal = value.trim();
		let changeAlarm: UserUpdateAlarm | null = null;
		if (!changeVal) return;
		if (changeVal) {
			if (userUpdateFormRegex[name] && !userUpdateFormRegex[name].test(changeVal)) {
				changeAlarm = { name, message: userUpdateFormRegexFailMent[name], status: "FAIL" };
			} else if (name == "phone") {
				if (changeVal !== user?.phone) setPhoneAuthComplete(false);
				else {
					setPhoneAuthComplete(true);
				}
			} else if (name === "phoneAuth") {
				if (changeVal.length < 6) {
					changeAlarm = { name, message: "인증번호 6자리를 입력해주세요.", status: "FAIL" };
				}
			}
		}
		setUserUpdateAlarm(changeAlarm);
		setUserUpdateForm((prev) => ({
			...prev,
			[name]: changeVal,
		}));
	};
	// 유저업데이트 완료
	const userUpdateSubmit = (e: FormEvent) => {
		console.log("userUpdateSubmit");
		e.preventDefault();
		/* 변한게 없으면 다시 그냥 유저정보보기 화면으로 */
		if (
			Object.entries(userUpdateForm).every((entry) => {
				const key = entry[0] as UserUpdateFormInputKeys;
				const value = entry[1];
				if (key === "phoneAuth") return true;
				return value === user[key];
			})
		) {
			console.log("변한게 없다!!");
			replace("/mypage/info");
			return;
		}
		/*  */
		if (userUpdateAlarm?.status === "FAIL") {
			userUpdateFormInputRefs.current[userUpdateAlarm.name]?.focus();
		}
		/*  */
		let changeAlarm: UserUpdateAlarm | null = null;
		const alertKeys = Object.keys(userUpdateForm) as UserUpdateFormInputKeys[];
		for (const key of alertKeys) {
			if (!userUpdateFormInputRefs.current[key]) continue;
			const value = userUpdateForm[key];
			// 알람없을 때 처음 누를 때
			if (!value) {
				changeAlarm = { name: key, message: "해당 내용을 입력해주세요.", status: "FAIL" };
			} else if (userUpdateFormRegex[key] && !userUpdateFormRegex[key].test(value)) {
				changeAlarm = { name: key, message: userUpdateFormRegexFailMent[key], status: "FAIL" };
			} else if (key == "phone" && !phoneAuthComplete) {
				changeAlarm = { name: key, message: "휴대폰 인증이 필요합니다.", status: "FAIL" };
			}
			if (changeAlarm) break;
		}
		if (changeAlarm) {
			setUserUpdateAlarm(changeAlarm);
			return;
		}
		console.log("내 정보 변경 완료");
		// handleUserUpdate.mutate();
	};
	/* ------------------------------------ */
	// 휴대폰 인증 보내기 버튼
	const clickPhoneAuth = () => {
		if (!userUpdateForm.phone) {
			setUserUpdateAlarm({
				name: "phone",
				message: "휴대폰 번호를 입력해주세요.",
				status: "FAIL",
			});
			userUpdateFormInputRefs.current.phone?.focus();
			return;
		}
		if (userUpdateFormRegex.phone) {
			if (!userUpdateFormRegex.phone.test(userUpdateForm.phone)) {
				setUserUpdateAlarm({
					name: "phone",
					message: userUpdateFormRegexFailMent.phone,
					status: "FAIL",
				});
				userUpdateFormInputRefs.current.phone?.focus();
				return;
			}
		}
		handlePhoneAuth.mutate();
	};
	// 휴대폰 인증확인 버튼
	const clickCheckPhoneAuth = () => {
		if (userUpdateAlarm?.name === "phoneAuth" && userUpdateAlarm.status === "FAIL") {
			userUpdateFormInputRefs.current.phoneAuth?.focus();
			return;
		}
		if (userUpdateForm.phoneAuth.length < 6) {
			setUserUpdateAlarm({ name: "phoneAuth", message: "인증번호 6자리를 입력해주세요.", status: "FAIL" });
			userUpdateFormInputRefs.current.phoneAuth?.focus();
			return;
		}
		handlePhoneAuthComplete.mutate();
	};

	return {
		userUpdateSubmit,
		userIdData,
		userUpdateForm,
		setUserUpdateForm,
		userUpdateAlarm,
		changeUserUpdateForm,
		clickPhoneAuth,
		validateUserUpdateForm,
		userUpdateFormInputRefs,
		phoneAuthView,
		clickCheckPhoneAuth,
	};
}
