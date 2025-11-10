"use client";

import AuthProvider from "@/providers/AuthProvider";
import { ApiError } from "@/types/common";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

// 공통 에러 핸들러 (전역 모달/토스트 등)
function handleGlobalMutationError(error: any) {
	// 표준화된 서버 에러 바디 { message, code }도 고려
	const message = error?.message || "";
	switch (message) {
		case "NETWORK_ERROR":
			console.log("네트워크 연결이 끊겼습니다.\n다시 시도해주세요.");
			//   openErrorModal("네트워크 연결이 끊겼습니다.\n다시 시도해주세요.");
			return;
		case "REQUEST_TIMEOUT":
			console.log("요청이 시간 초과되었습니다.\n잠시 후 다시 시도해주세요.");
			//   openErrorModal("요청이 시간 초과되었습니다.\n잠시 후 다시 시도해주세요.");
			return;
		// case "USER_NOT_FOUND":
		// 	console.log("아이디 또는 비밀번호가 일치하지 않습니다.");
		// 	//   openErrorModal("아이디 또는 비밀번호가 일치하지 않습니다.");
		// 	return;
		default:
		// 서버쪽 단순 에러도 여기로 옴.
		// console.log("서버 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.");
		// openErrorModal("서버 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.");
	}
}

export default function Providers({ children }: { children: ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				// ✅ 전역 공통 에러 처리: 모든 mutation 에러에 대해 항상 호출
				mutationCache: new MutationCache({
					onError: (error) => {
						handleGlobalMutationError(error);
					},
				}),
				// ✅ 기본 옵션: 재시도/네트워크 동작 등 "기본 동작" 정의
				defaultOptions: {
					mutations: {
						networkMode: "always",
						// 재시도 규칙: 네트워크/타임아웃만 1회 재시도, 그 외는 재시도 안 함
						retry: (failureCount, error: any) => {
							const m = error?.message || error?.msg;
							const retriable = m === "NETWORK_ERROR" || m === "REQUEST_TIMEOUT";
							if (!retriable) return false;
							return failureCount < 1; // 최대 1회 재시도
						},
						retryDelay: 10_000,
						// 주의) 여기서 onError를 넣으면 전역(onError) + 여기(onError) + 개별(onError) 모두 호출되어
						// 모달이 중복될 수 있어, 기본에선 넣지 않는 걸 권장합니다.
						// onError: (err) => { /* 필요시 로깅 정도만 */ },
					},
				},
			})
	);

	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>{children}</AuthProvider>
		</QueryClientProvider>
	);
}
