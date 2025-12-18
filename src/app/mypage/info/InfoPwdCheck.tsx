"use client";

import JoinInput from "@/components/user/JoinInput";
import useAuth from "@/hooks/useAuth";
import { ChangeEvent } from "@/types/auth";
import { useState } from "react";

export default function InfoPwdCheck() {
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
			<JoinInput
				name="password"
				label="비밀번호"
				placeholder="비밀번호를 입력해주세요."
				type="password"
				value={password}
				failMessage={failAlert}
				onChange={changePassword}
			/>
		</div>
	);
}
