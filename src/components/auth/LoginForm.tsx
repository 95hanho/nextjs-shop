import { useEffect, useRef, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi"; // 눈 모양 아이콘을 import 합니다.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { useRouter } from "next/navigation";
import { postJson } from "@/api/fetchFilter";
import { BaseResponse } from "@/types/common";
import { FormEvent } from "@/types/event";
import { LoginFormData } from "@/types/auth";
import styles from "./LoginForm.module.scss";
import clsx from "clsx";
import { AuthActionButton } from "@/components/auth/AuthActionButton";

export const LoginForm = () => {
	const router = useRouter();
	const queryClient = useQueryClient();

	const handleLogin = useMutation({
		mutationFn: (obj: LoginFormData) => postJson<BaseResponse>(getApiUrl(API_URL.AUTH), obj),
		// Mutation이 시작되기 직전에 특정 작업을 수행
		onMutate(a) {
			console.log(a);
		},
		onSuccess: async (data) => {
			alert("로그인!");
			await queryClient.invalidateQueries({ queryKey: ["me"] });
			router.push("/");
		},
		onError(err) {
			console.log(err);
			if (err.message === "USER_NOT_FOUND") {
				console.error(err.message);
				setAlarmMessage("아이디 또는 비밀번호가 일치하지 않습니다.");
			}
		},
		// 결과에 관계 없이 무언가 실행됨
		onSettled(data, err, params, context) {
			// console.log(data, err, params, context);
		},
	});

	const userIdRef = useRef<HTMLInputElement>(null);
	const pwdRef = useRef<HTMLInputElement>(null);
	const [loginForm, setLoginForm] = useState<LoginFormData>({
		userId: "hoseongs",
		password: "aaaaaa1!",
	});
	const [userIdFocus, setUserIdFocus] = useState<boolean>(loginForm.userId !== "");
	const [pwdFocus, setPwdFocus] = useState<boolean>(loginForm.password !== "");
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [alarmMessage, setAlarmMessage] = useState("");

	const loginSubmit = (e: FormEvent) => {
		console.log("loginSubmit");
		e.preventDefault();
		if (!loginForm.userId) {
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
					id="userId"
					name="userId"
					type="text"
					ref={userIdRef}
					onFocus={() => {
						setUserIdFocus(true);
					}}
					onBlur={() => {
						if (!loginForm.userId) {
							setUserIdFocus(false);
						}
					}}
					value={loginForm.userId}
					onChange={(e) => {
						setLoginForm({ ...loginForm, userId: e.target.value });
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
