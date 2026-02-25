"use client";

import Link from "next/link";
import { FormPageShell } from "@/components/auth/FormPageShell";
import { SellerLoginForm } from "@/components/seller/SellerLoginForm";

export default function SellerLoginClient() {
	return (
		<FormPageShell title="판매자 로그인">
			<SellerLoginForm />
			<div className="flex justify-center gap-5 p-0 text-xl">
				<Link className="hover:underline" href={"/user/join"}>
					판매자 등록
				</Link>
			</div>
		</FormPageShell>
	);
}
