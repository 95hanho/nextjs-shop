"use client";

import Link from "next/link";
import { SiKakaotalk, SiNaver } from "react-icons/si";
// import styles from "./LoginClient.module.scss";
import { LoginForm } from "@/components/auth/LoginForm";
import clsx from "clsx";

export default function SellerLoginClient() {
	return (
		<div className={styles.loginWrap}>
			<div className="form-wrap w-[350px] bg-white border-double border-gray-500 rounded-3xl text-center overflow-hidden shadow-sm p-5 text-lg">
				<h2 className="py-4 text-5xl">
					<Link href={"/"}>판매자 관리</Link>
				</h2>
				<LoginForm />
				<div className="flex justify-center gap-5 p-0 text-xl ">
					<Link className="hover:underline" href={"/user/join"}>
						회원가입
					</Link>
					<Link className="hover:underline" href={"/user/find/id"}>
						아이디 찾기
					</Link>
					<Link className="hover:underline" href={"/user/find/password"}>
						비밀번호 찾기
					</Link>
				</div>
				<div className="my-3">
					<button className={clsx(styles.snsButton, styles.naverLogin)}>
						<SiNaver size={24} />
						<span>네이버 로그인</span>
					</button>
				</div>
				<div className="my-3">
					<button className={clsx(styles.snsButton, styles.kakaoLogin)}>
						<SiKakaotalk size={24} />
						<span>카카오 로그인</span>
					</button>
				</div>
			</div>
		</div>
	);
}
