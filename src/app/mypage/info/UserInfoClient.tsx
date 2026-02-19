"use client";

import API_URL from "@/api/endpoints";
import { getNormal, postJson } from "@/api/fetchFilter";
import { InfoMark } from "@/components/auth/InfoMark";
import { NormalButton } from "@/components/ui/NormalButton";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import moment from "moment";
import { FormPageShell } from "@/components/auth/FormPageShell";
import { AuthActionButton } from "@/components/auth/AuthActionButton";

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
		onSuccess() {
			push("/user/password");
		},
		onError(err) {
			console.log(err);
		},
	});

	if (!user.name) return null;
	return (
		<FormPageShell title={"내 정보 수정"} wrapMinHeight={100}>
			<InfoMark title="아이디" infoVal={<span>{userIdResponse?.userId}</span>} />
			<InfoMark
				title="비밀번호"
				infoVal={
					<NormalButton
						title="비밀번호 변경"
						onClick={() => {
							handlePhoneAuth.mutate();
						}}
						bgColor="#f9c703"
						borderColor="#a98704"
						bgHoverColor="#efc007"
						bgActiveColor="#f9c90b"
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
						bgHoverColor="#5fa1e7"
						bgActiveColor="#3889df"
					/>
				}
			/>
			<InfoMark title="생년월일" infoVal={<span>{moment(user.birthday).format("YYYY/MM/DD")}</span>} />
			<InfoMark title="휴대폰" infoVal={<span>{user.phone}</span>} />
			<InfoMark title="이메일" infoVal={<span>{user.email}</span>} />
			<InfoMark title="이름" infoVal={<span>{user.name}</span>} />
			<InfoMark title="남은 마일리지" infoVal={<span>{user.mileage}</span>} />
			{user.tall > 0 && user.weight > 0 && (
				<InfoMark
					title="신체정보"
					infoVal={
						<span>
							{user.tall}cm / {user.weight}kg
						</span>
					}
				/>
			)}
			<AuthActionButton
				type="info"
				title="정보수정하기"
				btnType="button"
				onClick={() => {
					push("/mypage/update");
				}}
			/>
		</FormPageShell>
	);
}
