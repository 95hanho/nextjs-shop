"use client";

import API_URL from "@/api/endpoints";
import { getNormal, postJson } from "@/api/fetchFilter";
import { InfoMark } from "@/components/auth/InfoMark";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function UserInfoClient() {
	const { user, loginOn } = useAuth();
	const { push } = useRouter();

	const { data: userIdResponse } = useQuery<BaseResponse & { userId: string }>({
		queryKey: ["userInfoUserId"],
		queryFn: () => getNormal(getApiUrl(API_URL.AUTH_ID)),
		enabled: loginOn,
	});

	// 비밀변경 토큰 생성 후 비밀변경 페이지로
	const handlePhoneAuth = useMutation({
		mutationFn: () => postJson<BaseResponse>(getApiUrl(API_URL.AUTH_PASSWORD), {}),
		onSuccess(data) {
			push("/user/password");
		},
		onError(err) {
			console.log(err);
		},
	});

	if (!user) return null;
	return (
		<main id="userInfo" className="user-info">
			<div className="form-wrap">
				<h2>내 정보 수정</h2>
				<InfoMark title="아이디" infoVal={<span>{userIdResponse?.userId}</span>} />
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
							<button
								className="btn"
								onClick={() => {
									push("/mypage/address");
								}}
							>
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
					<input
						type="submit"
						className=""
						value={"정보수정하기"}
						onClick={() => {
							push("/mypage/update");
						}}
					/>
				</div>
			</div>
		</main>
	);
}
