"use client";

import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { InfoMark } from "@/components/form/InfoMark";
import { NormalButton } from "@/components/ui/NormalButton";
import { useAuth } from "@/hooks/context/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import moment from "moment";
import { FormPageShell } from "@/components/form/FormPageShell";
import { FormActionButton } from "@/components/form/FormActionButton";
import { useGetUserId } from "@/hooks/query/user/useGetUserId";

export default function UserInfoClient() {
	// 1) [store / custom hooks] -------------------------------------------
	const { user } = useAuth();
	const { push } = useRouter();
	const { data: userId } = useGetUserId();

	// 3) [useQuery / useMutation] -----------------------------------------
	// 비밀변경 토큰 생성
	const passwordChangeMutation = useMutation({
		mutationFn: () => postJson<BaseResponse>(getApiUrl(API_URL.AUTH_PASSWORD), {}),
		onSuccess() {
			// 비밀변경 페이지로
			push("/user/password");
		},
		onError(err) {
			console.log(err);
		},
	});

	if (!user.name) return null;
	return (
		<FormPageShell title={"내 정보"} wrapMinHeight={100}>
			<InfoMark title="아이디" infoVal={<span>{userId}</span>} />
			<InfoMark
				title="비밀번호"
				infoVal={
					<NormalButton
						title="비밀번호 변경"
						onClick={() => {
							passwordChangeMutation.mutate();
						}}
						bgColor="#f9c703"
						borderColor="#a98704"
						bgHoverColor="#efc007"
						bgActiveColor="#f9c90b"
						disabled={passwordChangeMutation.isPending}
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
			<FormActionButton
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
