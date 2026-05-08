import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getNormal, postJson } from "@/api/fetchFilter";
import { BaseResponse } from "@/types/common";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { LoginFormData } from "@/types/auth";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent } from "@/types/event";
import { FormInputAlarm, FormInputRefs } from "@/types/form";
import { SellerInfo, SellerPhoneAuthCheckRequest, SellerPhoneAuthRequest, SellerRegisterRequest } from "@/types/seller";
import { useGlobalDialogStore } from "@/store/globalDialog.store";

export interface JoinForm extends LoginFormData<"sellerId">, SellerInfo {
	phoneAuth: string;
	passwordCheck: string;
}
export type JoinFormInputKeys = keyof Omit<JoinForm, "zonecode">;
export type JoinFormAlarm = FormInputAlarm<JoinFormInputKeys>;
export type JoinFormInputRefs = FormInputRefs<JoinFormInputKeys>;

const initJoinForm: JoinForm = {
	sellerId: "",
	password: "",
	passwordCheck: "",
	sellerName: "",
	sellerNameEn: "",
	extensionNumber: "", // 내선전화
	mobileNumber: "", // 대표 번호
	phoneAuth: "",
	email: "", // 이메일
	businessRegistrationNumber: "", // 사업자 등록번호
	telecomSalesNumber: "", // 통신 판매자 번호
	representativeName: "", // 대표자 이름
	businessZipcode: "", // 사업장 소재지 우편번호
	businessAddress: "", // 사업장 소재지 주소
	businessAddressDetail: "", // 사업장 소재지 상세주소
};
const testJoinForm: JoinForm = {
	sellerId: "hoseongs",
	password: "aaaaaa1!",
	passwordCheck: "aaaaaa1!",
	sellerName: "한호성",
	sellerNameEn: "Han Hoseong",
	extensionNumber: "0212345678",
	mobileNumber: "01085546674",
	phoneAuth: "",
	email: "ehfqntuqntu@naver.com",
	businessRegistrationNumber: "123-45-67890",
	telecomSalesNumber: "123-45-67890",
	representativeName: "한호성",
	businessZipcode: "05718",
	businessAddress: "서울 송파구 중대로 121",
	businessAddressDetail: "2층",
};

const joinFormRegex: { [key: string]: RegExp } = {
	sellerId: /^[a-zA-Z][a-zA-Z0-9_]{5,14}$/,
	password: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,20}$/,
	extensionNumber: /^(0\d{1,2})\d{3,4}\d{4}$/,
	mobileNumber: /^(010|011|016|017|018|019)\d{3,4}\d{4}$/,
	email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
};
const joinFormRegexFailMent: { [key: string]: string } = {
	sellerId: "영문으로 시작하고 영문, 숫자, 언더스코어를 포함하는 6자이상 15자 이하 조합",
	password: "영문, 숫자, 특수문자 각각 1개이상 포함하는 8자이상 20자 이하 조합",
	extensionNumber: "내선번호 형식에 일치하지 않습니다.<br  />(예: 02-1234-5678 -> 0212345678)",
	mobileNumber: "휴대폰 번호 형식에 일치하지 않습니다.<br  />(예: 010-1234-5678 -> 01012345678)",
	email: "이메일 형식에 일치하지 않습니다.",
};

export function useSellerJoinForm() {
	// 1) [store / custom hooks] -------------------------------------------
	const router = useRouter();
	const { openDialog } = useGlobalDialogStore();

	// 2) [useState / useRef] ----------------------------------------------
	// 회원가입 폼 데이터
	const [joinForm, setJoinForm] = useState<JoinForm>(initJoinForm);
	// 회원가입 알람.
	const [joinAlarm, setJoinAlarm] = useState<JoinFormAlarm | null>(null);
	// 회원가입 input들 HTMLInputElement
	const joinFormInputRefs = useRef<Partial<JoinFormInputRefs>>({});
	// 아이디중복여부
	const [idDuplCheckOk, setIdDuplCheckOk] = useState<boolean>(false);
	// 인증번호 화면 띄울지
	const [phoneAuthView, setPhoneAuthView] = useState<boolean>(false);
	// 인증번호 토큰
	const [phoneAuthToken, setPhoneAuthToken] = useState<string | null>(null);
	// 휴대폰인증완료여부
	const [phoneAuthComplete, setPhoneAuthComplete] = useState<boolean>(false);

	// 3) [useQuery / useMutation] -----------------------------------------
	// 아이디중복확인
	const { refetch: idDuplCheck, isFetching: isIdDuplCheckFetching } = useQuery({
		queryKey: ["sellerIdDuplCheck", joinForm.sellerId.trim()],
		queryFn: () => getNormal<BaseResponse>(getApiUrl(API_URL.SELLER_ID), { sellerId: joinForm.sellerId.trim() }),
		enabled: false,
		retry: false,
	});
	// 휴대폰 인증
	const phoneAuthMutation = useMutation({
		mutationFn: () =>
			postJson<BaseResponse & { phoneAuthToken: string }, SellerPhoneAuthRequest>(getApiUrl(API_URL.SELLER_PHONE_AUTH), {
				phone: joinForm.mobileNumber,
				mode: "REGISTRATION",
			}),
		onSuccess(data) {
			setPhoneAuthView(true);
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
				changeJoinAlarm("mobileNumber", "이미 존재하는 번호입니다.", "FAIL");
			}
		},
	});
	// 휴대폰 인증 확인
	const phoneAuthCompleteMutation = useMutation({
		mutationFn: async () => {
			if (!phoneAuthToken) {
				// 인증을 다시 해야한다는 동작
				return;
			}
			return postJson<BaseResponse, SellerPhoneAuthCheckRequest>(getApiUrl(API_URL.SELLER_PHONE_AUTH_CHECK), {
				phoneAuthToken,
				authNumber: joinForm.phoneAuth,
			});
		},
		onSuccess() {
			setPhoneAuthComplete(true);
			setPhoneAuthView(false);
			changeJoinAlarm("mobileNumber", "휴대폰 인증이 완료되었습니다.");
		},
		onError(err) {
			console.log(err);
			if (["VERIFICATION_EXPIRED", "PHONEAUTH_TOKEN_UNAUTHORIZED"].includes(err.message)) {
				changeJoinAlarm("mobileNumber", "인증시간이 만료되었습니다.", "FAIL");
				setPhoneAuthView(false);
			}
			if (err.message === "INVALID_VERIFICATION_CODE") {
				changeJoinAlarm("phoneAuth", "인증번호가 일치하지 않습니다.", "FAIL");
			}
		},
	});
	// 회원가입
	const sellerRegisterMutation = useMutation({
		mutationFn: () => postJson<BaseResponse, SellerRegisterRequest>(getApiUrl(API_URL.SELLER_REGISTRATION), { ...joinForm }),
		onSuccess() {
			openDialog("ALERT", {
				content: "회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.",
				handleAfterClose: () => {
					router.push("/seller/login");
				},
			});
		},
		onError(err) {
			console.log(err);
			if (err.message === "PHONEAUTH_COMPLETE_UNAUTHORIZED") {
				setPhoneAuthComplete(false);
				changeJoinAlarm("mobileNumber", "인증시간이 만료되었습니다. 다시 인증해주세요.", "FAIL");
			}
		},
	});

	// 5) [handlers / useCallback] -----------------------------------------
	// 회원가입 input onChange
	const changeJoinAlarm = (name: JoinFormInputKeys, message: string, status: "SUCCESS" | "FAIL" = "SUCCESS") => {
		setJoinAlarm({ name, message, status });
	};
	// joinForm set
	const changeJoinForm = (e: ChangeEvent) => {
		const { name, value } = e.target as {
			name: JoinFormInputKeys;
			value: string;
		};
		let changeValue: string | number = value;
		let changeAlarm: JoinFormAlarm | null = null;

		if (name == "passwordCheck") {
			if (joinForm.password && joinForm.password != value) {
				changeAlarm = { name: "passwordCheck", message: "비밀번호와 일치하지 않습니다.", status: "FAIL" };
			}
		}
		if (name === "mobileNumber" || name === "extensionNumber") {
			changeValue = value.replace(/[^0-9]/g, "").slice(0, 13); // 예: 13자리 인증번호
			setPhoneAuthView(false);
			setPhoneAuthComplete(false);
		}
		if (name === "phoneAuth") {
			changeValue = value.replace(/[^0-9]/g, "").slice(0, 6); // 예: 6자리 인증번호
		}
		setJoinAlarm(changeAlarm);
		setJoinForm((prev) => ({
			...prev,
			[name]: changeValue,
		}));
	};
	// 유효성 확인 ex) 아이디 중복확인, 정규표현식 확인
	const validateJoinForm = async (e: ChangeEvent) => {
		const { name, value } = e.target as {
			name: JoinFormInputKeys;
			value: string;
		};
		const changeVal = value.trim();
		let changeAlarm: JoinFormAlarm | null = null;

		if (!changeVal) return;
		if (changeVal) {
			if (joinFormRegex[name] && !joinFormRegex[name].test(changeVal)) {
				changeAlarm = { name, message: joinFormRegexFailMent[name], status: "FAIL" };
			} else {
				if (name == "sellerId") {
					if (isIdDuplCheckFetching) return;
					const { isSuccess, error, isError } = await idDuplCheck();
					if (isSuccess) {
						changeAlarm = { name, message: "사용가능한 아이디입니다." };
						setIdDuplCheckOk(true);
					}
					if (isError && error?.message === "SELLER_ID_DUPLICATED") {
						changeAlarm = { name, message: "중복된 아이디가 존재합니다.", status: "FAIL" };
						setIdDuplCheckOk(false);
					}
				} else if (name == "password") {
					if (joinForm.passwordCheck && joinForm.passwordCheck != changeVal) {
						changeAlarm = { name: "passwordCheck", message: "비밀번호와 일치하지 않습니다.", status: "FAIL" };
					}
				} else if (name == "passwordCheck") {
					if (joinForm.password && joinForm.password != changeVal) {
						changeAlarm = { name, message: "비밀번호와 일치하지 않습니다.", status: "FAIL" };
					}
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
		e.preventDefault();
		if (joinAlarm?.status === "FAIL") {
			joinFormInputRefs.current[joinAlarm.name]?.focus();
			return;
		}
		let changeAlarm: JoinFormAlarm | null = null;
		const alertKeys = Object.keys(joinForm) as JoinFormInputKeys[];
		for (const key of alertKeys) {
			if (!joinFormInputRefs.current[key]) continue;
			const value = joinForm[key];
			// 알람없을 때 처음 누를 때
			const emptyPossibleKeys: JoinFormInputKeys[] = [
				"sellerNameEn",
				"extensionNumber",
				"businessRegistrationNumber",
				"telecomSalesNumber",
				"representativeName",
				"businessZipcode",
				"businessAddress",
				"businessAddressDetail",
			];
			if (!emptyPossibleKeys.includes(key) && !value) {
				changeAlarm = { name: key, message: "해당 내용을 입력해주세요.", status: "FAIL" };
				joinFormInputRefs.current[key]?.focus();
			}
			// 정규표현식 검사
			else if (value && joinFormRegex[key] && !joinFormRegex[key].test(value)) {
				changeAlarm = { name: key, message: joinFormRegexFailMent[key], status: "FAIL" };
			} else if (key == "sellerId" && !idDuplCheckOk) {
				changeAlarm = { name: key, message: "아이디 중복확인을 해주세요.", status: "FAIL" };
			} else if (key === "password" && joinForm.password !== joinForm.passwordCheck) {
				changeAlarm = { name: "passwordCheck", message: "비밀번호와 일치하지 않습니다.", status: "FAIL" };
			} else if (key === "passwordCheck" && joinForm.password !== joinForm.passwordCheck) {
				changeAlarm = { name: "passwordCheck", message: "비밀번호와 일치하지 않습니다.", status: "FAIL" };
			} else if (key == "mobileNumber" && !phoneAuthComplete) {
				changeAlarm = { name: key, message: "휴대폰 인증이 필요합니다.", status: "FAIL" };
			}

			if (changeAlarm) break;
		}
		if (changeAlarm) {
			setJoinAlarm(changeAlarm);
			return;
		}
		// 회원가입 로직 추가
		sellerRegisterMutation.mutate();
	};
	// 휴대폰 인증 보내기 버튼
	const clickPhoneAuth = () => {
		if (phoneAuthMutation.isPending) return;
		if (!joinForm.mobileNumber) {
			changeJoinAlarm("mobileNumber", "휴대폰 번호를 입력해주세요.", "FAIL");
			joinFormInputRefs.current.mobileNumber?.focus();
			return;
		}
		if (joinFormRegex.mobileNumber) {
			if (!joinFormRegex.mobileNumber.test(joinForm.mobileNumber)) {
				changeJoinAlarm("mobileNumber", joinFormRegexFailMent.mobileNumber, "FAIL");
				joinFormInputRefs.current.mobileNumber?.focus();
				return;
			}
		}
		phoneAuthMutation.mutate();
	};
	// 휴대폰 인증확인 버튼
	const clickCheckPhoneAuth = () => {
		if (joinAlarm?.name === "phoneAuth" && joinAlarm.status === "FAIL") {
			joinFormInputRefs.current.phoneAuth?.focus();
			return;
		}
		if (joinForm.phoneAuth.length < 6) {
			setJoinAlarm({ name: "phoneAuth", message: "인증번호 6자리를 입력해주세요.", status: "FAIL" });
			joinFormInputRefs.current.phoneAuth?.focus();
			return;
		}
		phoneAuthCompleteMutation.mutate();
	};

	// 6) [useEffect] ------------------------------------------------------
	useEffect(() => {
		if (joinForm.sellerId === "123159") {
			setJoinForm(testJoinForm);
		}
	}, [joinForm.sellerId]);

	return {
		joinSubmit,
		joinForm,
		setJoinForm,
		joinAlarm,
		joinFormInputRefs,
		changeJoinForm,
		validateJoinForm,
		clickPhoneAuth,
		phoneAuthView,
		clickCheckPhoneAuth,
	};
}
