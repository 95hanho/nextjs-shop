import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { GetUserResponse } from "@/types/auth";
import { useQuery } from "@tanstack/react-query";

export function useGetUserInfo() {
	const { user: initialUser, setUser } = useAuth();

	return useQuery({
		queryKey: ["me"],
		queryFn: async () => {
			try {
				const data = await getNormal<GetUserResponse>(getApiUrl(API_URL.AUTH));
				const user = data.user ?? null; // undefined 방지
				// console.log("user", user);
				setUser(user);
				return user;
			} catch (err: unknown) {
				const { status, payload } = toErrorResponse(err);

				// ✅ 비로그인 정상 케이스: 에러로 보지 말고 익명 처리
				if (status === 401 || payload?.message === "UNAUTHORIZED" || payload?.message === "SESSION_EXPIRED") {
					setUser(initialUser);
					return initialUser;
				}

				// 그 외만 진짜 에러로 던짐 (전역 에러 핸들러가 처리)
				throw err;
			}
		},
		initialData: initialUser ?? null,
		// placeholderData: initialUser ?? null, // ✅ UI는 바로 보여주되
		// staleTime: 0, // 자동으로 refetch필요 없으므로 0으로
		// staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
		// staleTime: 5000, // 5초 캐시 유지
		// retry: 1, // 재시도 한 번만

		// =========================================
		// 로그인, 로그아웃, 로그아웃 시에만 수동으로 다시가져올꺼.
		// =========================================
		retry: false,
		staleTime: Infinity,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: "always", // ✅ 새로고침/첫 진입에서만 1번 확인
	});
}
