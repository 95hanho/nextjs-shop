"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi"; // 눈 모양 아이콘을 import 합니다.
import { SiNaver, SiKakaotalk } from "react-icons/si"; // 네이버와 카카오 아이콘을 import 합니다.
import { FormEvent, LoginData } from "@/types/form";
import { useRouter } from "next/navigation";

export default function Login() {
	const router = useRouter();

	const idRef = useRef<HTMLInputElement>(null);
	const pwdRef = useRef<HTMLInputElement>(null);
	const [idFocus, set_idFocus] = useState<boolean>(false);
	const [pwdFocus, set_pwdFocus] = useState<boolean>(false);
	const [loginData, set_loginData] = useState<LoginData>({
		id: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState<boolean>(false);

	const login_submit = (e: FormEvent) => {
		e.preventDefault();
		console.log("login_submit");
		router.push("/");
	};

	return (
		<div id="login" className="member-wrapper">
			<div className="form-wrap">
				<h2>
					<Link href={"/"}>NextJS-SHOP</Link>
				</h2>
				<form action="" onSubmit={login_submit}>
					<div
						className={`login-input ${idFocus ? "focus" : ""}`}
						onMouseDown={(e) => {
							if (!idFocus) {
								e.preventDefault();
								idRef.current?.focus();
							}
						}}
					>
						<input
							type="text"
							ref={idRef}
							onFocus={() => {
								set_idFocus(true);
							}}
							onBlur={() => {
								if (!loginData.id) {
									set_idFocus(false);
								}
							}}
							value={loginData.id}
							onChange={(e) => set_loginData({ ...loginData, id: e.target.value })}
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
								set_pwdFocus(true);
							}}
							onBlur={() => {
								if (!loginData.password) {
									set_pwdFocus(false);
								}
							}}
							value={loginData.password}
							onChange={(e) => {
								setShowPassword(false);
								set_loginData({ ...loginData, password: e.target.value });
							}}
						/>
						<label className={`placeholder`}>비밀번호</label>
						{pwdFocus && loginData.password && (
							<button
								className="show-pwd"
								type="button"
								onClick={() => setShowPassword(!showPassword)}
							>
								{showPassword ? <FiEyeOff /> : <FiEye />}
							</button>
						)}
					</div>
					<div className="submit-wrap">
						<input type="submit" value={"로그인"} />
					</div>
				</form>
				<div className="find-wrap">
					<Link href={"/member/join"}>회원가입</Link>
					<Link href={""}>아이디 찾기</Link>
					<Link href={""}>비밀번호 찾기</Link>
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
		</div>
	);
}
