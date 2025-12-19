"use client";

import JoinInput from "@/components/user/JoinInput";
import useAuth from "@/hooks/useAuth";
import { ChangeEvent } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InfoPwdCheck() {
	const router = useRouter();
	const { user } = useAuth();

	const [password, setPassword] = useState<string>("");
	const [failAlert, setFailAlert] = useState<string>("");
	const changePassword = (e: ChangeEvent) => {
		setPassword(e.target.value);
	};

	if (!user) return null;

	return (
		<div id="infoPwdCheck" className="form-wrap">
			<h2>비밀번호를 다시 입력해주세요.</h2>
			<div className="join-input mark">
				<div className="join-label">
					<label>아이디</label>
				</div>
				<div className={`join-text`}>
					<div className="info-val">
						<span>{user?.userId}</span>
					</div>
				</div>
			</div>
			<div className="join-input mark">
				<div className="join-label">
					<label>비밀번호</label>
				</div>
				<div className={`join-text`}>
					<div className="info-val">
						<button
							className="btn"
							onClick={() => {
								router.push("/user/password");
							}}
						>
							비밀번호 변경
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
