import { useRef, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { AuthActionButton } from "@/components/auth/AuthActionButton";
import styles from "./LoginForm.module.scss";
import { BaseResponse } from "@/types/common";
import { FormEvent } from "@/types/event";
import { LoginFormData } from "@/types/auth";
import { postJson } from "@/api/fetchFilter";

interface CommonLoginFormProps {
	apiUrl: string;
	redirectTo: string;
	invalidateKeys: string[];
	loginIdField?: string; // 로그인 아이디 필드명 추가
}

export const CommonLoginForm = ({ apiUrl, redirectTo, invalidateKeys, loginIdField = "userId" }: CommonLoginFormProps) => {
	const router = useRouter();
	const queryClient = useQueryClient();

	const handleLogin = useMutation({
		mutationFn: (obj: LoginFormData<typeof loginIdField>) => postJson<BaseResponse>(apiUrl, obj),
		onMutate(a) {
			console.log(a);
		},
		onSuccess: async () => {
			alert("로그인!");
			await queryClient.invalidateQueries({ queryKey: invalidateKeys });
			router.push(redirectTo);
		},
		onError(err) {
			console.log(err);
			if (err.message === "USER_NOT_FOUND") {
				console.error(err.message);
				setAlarmMessage("아이디 또는 비밀번호가 일치하지 않습니다.");
			}
		},
		onSettled(data, err, params, context) {
			console.log(data, err, params, context);
		},
	});

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

	const loginSubmit = (e: FormEvent) => {
		e.preventDefault();
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
		handleLogin.mutate(loginForm);
	};

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
			<AuthActionButton title="로그인" />
		</form>
	);
};
