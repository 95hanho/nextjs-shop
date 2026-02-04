"use client";

import API_URL from "@/api/endpoints";
import { getNormal, postJson } from "@/api/fetchFilter";
import { InfoMark } from "@/components/auth/InfoMark";
import { NormalButton } from "@/components/common/NormalButton";
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
				<InfoMark
					title="비밀번호"
					infoVal={
						<NormalButton
							title="비밀번호 변경"
							onClick={() => {
								handlePhoneAuth.mutate();
							}}
							bgColor="#d7ac06"
							borderColor="#a98704"
							bgActiveColor="#efc007"
						/>
					}
				/>
				<InfoMark title="이름" infoVal={<span>{user.name}</span>} />
				<InfoMark
					title="배송지관리"
					infoVal={
						<NormalButton
							title="수정하기"
							onClick={() => {
								push("/mypage/address");
							}}
							bgColor="#0b66c7"
							borderColor="#0b4889"
							bgHoverColor=""
							bgActiveColor=""
						/>
					}
				/>
				<InfoMark title="생년월일" infoVal={<span>{user.birthday}</span>} />
				<InfoMark title="휴대폰" infoVal={<span>{user.phone}</span>} />
				<InfoMark title="이메일" infoVal={<span>{user.email}</span>} />
				<InfoMark title="이름" infoVal={<span>{user.name}</span>} />
				<InfoMark title="이름" infoVal={<span>{user.name}</span>} />
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
