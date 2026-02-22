import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { GetAdminInfoResponse } from "@/types/admin";
import { useQuery } from "@tanstack/react-query";

export function useGetAdminInfo() {
	const { admin: initialAdmin, setAdmin } = useAdminAuth();

	return useQuery({
		queryKey: ["adminInfo"],
		queryFn: async () => {
			const data = await getNormal<GetAdminInfoResponse>(getApiUrl(API_URL.ADMIN));
			const admin = data.admin ?? null; // undefined 방지
			// console.log("admin", admin);
			setAdmin(admin);
			return admin;
		},
		initialData: initialAdmin ?? null,
		retry: 1, // 재시도 한 번만
		// 로그인, 로그아웃, 로그아웃 시에만 수동으로 다시가져올꺼.
		// 자동으로 refetch필요 없으므로 0으로
		staleTime: 0,
		// staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
		// staleTime: 5000, // 5초 캐시 유지
	});
}
