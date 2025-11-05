"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi"; // 눈 모양 아이콘을 import 합니다.
import { SiNaver, SiKakaotalk } from "react-icons/si"; // 네이버와 카카오 아이콘을 import 합니다.
import useUser from "@/hooks/query/useUser";
import { FormEvent, LoginForm, loginResponse } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import { getBaseUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { postUrlFormData } from "@/api/fetchFilter";
import Error from "next/error";

export default function Login() {
	const router = useRouter();
	const { loginToken } = useAuth();

	const handleLogin = useMutation({
		mutationFn: (obj: LoginForm) => postUrlFormData<loginResponse>(getBaseUrl() + API_URL.USER, obj),
		// Mutation이 시작되기 직전에 특정 작업을 수행
		onMutate(a) {
			console.log(a);
		},
		onSuccess(data) {
			console.log(data);
			alert("로그인!");
			// loginToken(data.accessToken, data.refreshToken);
			// router.push("/");
		},
		onError(err) {
			console.log(err);
		},
		// 결과에 관계 없이 무언가 실행됨
		onSettled(data, err, params, context) {
			// console.log(data, err, params, context);
		},
	});

	const userIdRef = useRef<HTMLInputElement>(null);
	const pwdRef = useRef<HTMLInputElement>(null);
	const [userIdFocus, setUserIdFocus] = useState<boolean>(false);
	const [pwdFocus, setPwdFocus] = useState<boolean>(false);
	const [loginForm, setLoginForm] = useState<LoginForm>({
		userId: "hoseongs",
		password: "aaaaaa1!",
	});
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [alertMessage, setAlertMessage] = useState("");

	const loginSubmit = (e: FormEvent) => {
		console.log("loginSubmit");
		e.preventDefault();
		if (!loginForm.userId) {
			setAlertMessage("아이디를 입력해주세요.");
			userIdRef.current?.focus();
			return;
		}
		if (!loginForm.password) {
			setAlertMessage("비밀번호를 입력해주세요.");
			pwdRef.current?.focus();
			return;
		}
		handleLogin.mutate(loginForm, {
			onError(err) {
				setAlertMessage("아이디 또는 비밀번호가 일치하지 않습니다.");
			},
		});
	};

	useEffect(() => {
		if (loginForm.userId) {
			setUserIdFocus(true);
		}
		if (loginForm.password) {
			setPwdFocus(true);
		}
	}, []);

	return (
		<main id="login" className="user-wrapper">
			<div className="form-wrap">
				<h2>
					<Link href={"/"}>NextJS-SHOP</Link>
				</h2>
				<form action="" onSubmit={loginSubmit}>
					<div
						className={`login-input ${userIdFocus ? "focus" : ""}`}
						onMouseDown={(e) => {
							if (!userIdFocus) {
								e.preventDefault();
								userIdRef.current?.focus();
							}
						}}
					>
						<input
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
								setAlertMessage("");
							}}
						/>
						<label className={`placeholder`}>아이디</label>
					</div>
					<div
						className={`login-input ${pwdFocus ? "focus" : ""}`}
						onMouseDown={(e) => {
							if (!pwdFocus) {
								e.preventDefault();
								pwdRef.current?.focus();
							}
						}}
					>
						<input
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
								setAlertMessage("");
							}}
						/>
						<label className={`placeholder`}>비밀번호</label>
						{pwdFocus && loginForm.password && (
							<button className="show-pwd" type="button" onClick={() => setShowPassword(!showPassword)}>
								{showPassword ? <FiEyeOff /> : <FiEye />}
							</button>
						)}
					</div>
					{alertMessage && <p>* {alertMessage}</p>}
					<div className="submit-wrap">
						<input type="submit" value={"로그인"} />
					</div>
				</form>
				<div className="find-wrap">
					<Link href={"/user/join"}>회원가입</Link>
					<Link href={"/user/find/id"}>아이디 찾기</Link>
					<Link href={"/user/find/password"}>비밀번호 찾기</Link>
				</div>
				<div className="sns-login">
					<button className="naver-login">
						<SiNaver size={24} />
						<span>네이버 로그인</span>
					</button>
				</div>
				<div className="sns-login">
					<button className="kakao-login">
						<SiKakaotalk size={24} />
						<span>카카오 로그인</span>
					</button>
				</div>
			</div>
		</main>
	);
}
