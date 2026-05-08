import { useEffect, useRef, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { FormActionButton } from "@/components/form/FormActionButton";
import styles from "./Form.module.scss";
import { BaseResponse } from "@/types/common";
import { FormEvent } from "@/types/event";
import { LoginFormData } from "@/types/auth";
import { postJson } from "@/api/fetchFilter";
import { useGlobalDialogStore } from "@/store/globalDialog.store";

const testUser = {
	id: "hoseongs",
	password: "aaaaaa1!",
};
const testSeller = {
	id: "seller01",
	password: "a123456!!",
};
const testAdmin = {
	id: "admin",
	password: "a123456!!",
};

interface CommonLoginFormProps {
	apiUrl: string;
	redirectTo: string;
	invalidateKeys: string[];
	loginIdField?: string; // 로그인 아이디 필드명 추가
}

export const CommonLoginForm = ({ apiUrl, redirectTo, invalidateKeys, loginIdField = "userId" }: CommonLoginFormProps) => {
	// 1) [store / custom hooks] -------------------------------------------
	const router = useRouter();
	const queryClient = useQueryClient();
	const searchParams = useSearchParams();
	const { openDialog } = useGlobalDialogStore();
	const pathname = usePathname();
	const message = searchParams.get("message");

	// 2) [useState / useRef] ----------------------------------------------
	const userIdRef = useRef<HTMLInputElement>(null);
	const pwdRef = useRef<HTMLInputElement>(null);
	const [loginForm, setLoginForm] = useState<LoginFormData<typeof loginIdField>>({
		[loginIdField]: "",
		password: "",
	} as LoginFormData);
	const [userIdFocus, setUserIdFocus] = useState<boolean>(false);
	const [pwdFocus, setPwdFocus] = useState<boolean>(false);
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [alarmMessage, setAlarmMessage] = useState("");
	const [returnUrl, setReturnUrl] = useState<string | null>(null); // ✅ returnUrl 저장

	// 3) [useQuery / useMutation] -----------------------------------------
	// 로그인 API
	const loginMutation = useMutation({
		mutationFn: (obj: LoginFormData<typeof loginIdField>) => postJson<BaseResponse>(apiUrl, obj),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: invalidateKeys }); // 로그인 후 해당 info 초기화
			openDialog("ALERT", {
				content: "로그인 되었습니다.",
				handleAfterClose: () => {
					// ✅ state에 저장된 returnUrl 사용
					if (returnUrl) {
						// console.log("returnUrl 존재, 이동:", returnUrl);
						const target = decodeURIComponent(returnUrl ?? redirectTo);
						window.location.replace(target); // ✅ 무조건 서버로 다시 요청 → middleware 확실히 탐
					} else {
						// console.log("returnUrl 없음, 기본 이동:", redirectTo);
						router.push(redirectTo);
					}
				},
			});
		},
		onError(err) {
			console.log(err);
			if (err.message === "USER_NOT_FOUND" || err.message === "LOGIN_FAILED" || err.message === "SELLER_NOT_FOUND") {
				console.error(err.message);
				openDialog("ALERT", {
					content: "아이디 또는 비밀번호가 일치하지 않습니다.",
				});
			}
			if (err.message === "SELLER_APPROVAL_PENDING") {
				openDialog("ALERT", {
					content: "관리자 승인 대기중인 계정입니다. 승인이 완료되면 로그인 가능합니다.",
				});
			}
			if (err.message === "SELLER_APPROVAL_REJECTED") {
				openDialog("ALERT", {
					content: "관리자 승인 거부된 계정입니다. 자세한 내용은 고객센터에 문의해주세요.",
				});
			}
			if (err.message === "SELLER_SUSPENDED") {
				openDialog("ALERT", {
					content: "정지된 계정입니다. 자세한 내용은 고객센터에 문의해주세요.",
				});
			}
		},
	});

	// 5) [handlers / useCallback] -----------------------------------------
	const loginSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (loginMutation.isPending) return; // 중복 로그인 방지
		if (!loginForm[loginIdField]) {
			setAlarmMessage("아이디를 입력해주세요.");
			userIdRef.current?.focus();
			return;
		}
		if (!loginForm.password) {
			setAlarmMessage("비밀번호를 입력해주세요.");
			pwdRef.current?.focus();
			return;
		}
		loginMutation.mutate(loginForm);
	};

	// 6) [useEffect] ------------------------------------------------------
	// pathname에 따라 로그인 폼에 미리 데이터 채워넣기 (개발 편의용)
	useEffect(() => {
		// 테스트 계정 로그인 데이터 자동 입력 (개발 편의용)
		if (loginForm[loginIdField] === "123159") {
			if (pathname.startsWith("/user")) {
				setLoginForm({ [loginIdField]: testUser.id, password: testUser.password });
			}
			if (pathname.startsWith("/seller")) {
				setLoginForm({ [loginIdField]: testSeller.id, password: testSeller.password });
			}
			if (pathname.startsWith("/admin")) {
				setLoginForm({ [loginIdField]: testAdmin.id, password: testAdmin.password });
			}
		}
	}, [pathname, loginIdField, loginForm]);
	useEffect(() => {
		const url = searchParams.get("returnUrl");
		const params = new URLSearchParams(searchParams);
		// 로그인 필요 페이지 접근 시
		if (message === "need_login") {
			// ✅ returnUrl을 state에 저장 (로그인 후 사용)
			openDialog("ALERT", { content: "로그인이 필요한 서비스입니다." });

			// ✅ query parameter 제거 (페이지 새로고침 시 모달 안 띄워짐)
			params.delete("message");
		}
		// returnUrl이 있을 때 state에 저장하고 query에서 제거 (로그인 후 리디렉션 시 사용)
		if (url) {
			setReturnUrl(url);
			params.delete("returnUrl");

			const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
			router.replace(newUrl);
		}
	}, [message, openDialog, router, searchParams]);

	return (
		<form action="" onSubmit={loginSubmit}>
			<div
				className={clsx(userIdFocus && styles.labelFocus, styles.loginInput)}
				onMouseDown={(e) => {
					if (!userIdFocus) {
						e.preventDefault();
						userIdRef.current?.focus();
					}
				}}
			>
				<input
					id={loginIdField}
					name={loginIdField}
					type="text"
					ref={userIdRef}
					onFocus={() => {
						setUserIdFocus(true);
					}}
					onBlur={() => {
						if (!loginForm[loginIdField]) {
							setUserIdFocus(false);
						}
					}}
					value={loginForm[loginIdField]}
					onChange={(e) => {
						setLoginForm({ ...loginForm, [loginIdField]: e.target.value });
						setAlarmMessage("");
					}}
				/>
				<label>아이디</label>
			</div>
			<div
				className={clsx(pwdFocus && styles.labelFocus, styles.loginInput)}
				onMouseDown={(e) => {
					if (!pwdFocus) {
						e.preventDefault();
						pwdRef.current?.focus();
					}
				}}
			>
				<input
					id="password"
					name="password"
					type={showPassword ? "text" : "password"}
					ref={pwdRef}
					onFocus={() => {
						setPwdFocus(true);
					}}
					onBlur={() => {
						if (!loginForm.password) {
							setPwdFocus(false);
						}
					}}
					value={loginForm.password}
					onChange={(e) => {
						setShowPassword(false);
						setLoginForm({ ...loginForm, password: e.target.value });
						setAlarmMessage("");
					}}
				/>
				<label>비밀번호</label>
				{pwdFocus && loginForm.password && (
					<button className={styles.showPwd} type="button" onClick={() => setShowPassword(!showPassword)}>
						{showPassword ? <FiEyeOff /> : <FiEye />}
					</button>
				)}
			</div>
			{alarmMessage && <p>* {alarmMessage}</p>}
			<FormActionButton title="로그인" disabled={loginMutation.isPending} />
		</form>
	);
};
