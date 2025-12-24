"use client";

import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import JoinInput from "@/components/user/JoinInput";
import useAuth from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { ChangeEvent } from "@/types/auth";
import { BaseResponse } from "@/types/common";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UserInfo() {
	const router = useRouter();
	const { user } = useAuth();

	// 비밀변경 토큰 생성 후 비밀변경 페이지로
	const handlePhoneAuth = useMutation({
		mutationFn: () => postJson<BaseResponse>(getApiUrl(API_URL.AUTH_PASSWORD), {}),
		onSuccess(data) {
			router.push("/user/password");
		},
		onError(err) {
			console.log(err);
		},
	});

	const [password, setPassword] = useState<string>("");
	const [failAlert, setFailAlert] = useState<string>("");
	const changePassword = (e: ChangeEvent) => {
		setPassword(e.target.value);
	};

	if (!user) return null;
	return (
		<div id="infoPwdCheck" className="form-wrap">
			<div>
				<h2>내 정보</h2>
				<div className="join-input mark">
					<div className="join-label">
						<label>아이디</label>
					</div>
					<div className={`join-text`}>
						<div className="info-val">
							<span>{user.userId}</span>
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
									handlePhoneAuth.mutate();
								}}
							>
								비밀번호 변경
							</button>
						</div>
					</div>
				</div>
				<div className="join-input mark">
					<div className="join-label">
						<label>이름</label>
					</div>
					<div className={`join-text`}>
						<div className="info-val">
							<span>{user.name}</span>
						</div>
					</div>
				</div>
				<div className="join-input mark">
					<div className="join-label">
						<label>배송지관리</label>
					</div>
					<div className={`join-text`}>
						<div className="info-val">
							<button className="btn" onClick={() => {}}>
								수정하기
							</button>
						</div>
					</div>
				</div>
				<div className="join-input mark">
					<div className="join-label">
						<label>생년월일</label>
					</div>
					<div className={`join-text`}>
						<div className="info-val">
							<span>{user.birthday}</span>
						</div>
					</div>
				</div>
				<div className="join-input mark">
					<div className="join-label">
						<label>휴대폰</label>
					</div>
					<div className={`join-text`}>
						<div className="info-val">
							<span>{user.phone}</span>
						</div>
					</div>
				</div>
				<div className="join-input mark">
					<div className="join-label">
						<label>이메일</label>
					</div>
					<div className={`join-text`}>
						<div className="info-val">
							<span>{user.email}</span>
						</div>
					</div>
				</div>
				<div className="submit-wrap info">
					<input type="submit" className="" value={"정보수정하기"} />
				</div>
			</div>
		</div>
	);
}
