"use client";

import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { FormPageShell } from "@/components/auth/FormPageShell";

export default function SellerLoginClient() {
	return (
		<FormPageShell title="판매자 로그인">
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
		</FormPageShell>
	);
}
