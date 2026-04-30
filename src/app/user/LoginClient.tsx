"use client";

import Link from "next/link";
import { SiKakaotalk, SiNaver } from "react-icons/si";
import styles from "./Login.module.scss";
import { LoginForm } from "@/components/auth/LoginForm";
import clsx from "clsx";
import { FormPageShell } from "@/components/form/FormPageShell";
import { useGlobalDialogStore } from "@/store/globalDialog.store";

export default function LoginClient() {
	const { openDialog } = useGlobalDialogStore();

	return (
		<FormPageShell title="로그인">
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
				<button
					className={clsx(styles.snsButton, styles.naverLogin)}
					onClick={() => {
						openDialog("ALERT", { content: "준비되지 않은 컨텐츠입니다." });
					}}
				>
					<SiNaver size={24} />
					<span>네이버 로그인</span>
				</button>
			</div>
			<div className="my-3">
				<button
					className={clsx(styles.snsButton, styles.kakaoLogin)}
					onClick={() => {
						openDialog("ALERT", { content: "준비되지 않은 컨텐츠입니다." });
					}}
				>
					<SiKakaotalk size={24} />
					<span>카카오 로그인</span>
				</button>
			</div>
		</FormPageShell>
	);
}
