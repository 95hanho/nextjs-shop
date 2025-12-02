"use client";

import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import useAuth from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { UserResponse } from "@/types/auth";
import { useQuery } from "@tanstack/react-query";

export function useGetUserInfo() {
	const { user: initialUser, setUser } = useAuth();

	return useQuery({
		queryKey: ["me"],
		queryFn: async () => {
			const data = await getNormal<UserResponse>(getApiUrl(API_URL.AUTH));
			const user = data.user ?? null; // undefined 방지
			setUser(user);
			return user;
		},
		initialData: initialUser ?? null,
		retry: 1, // 재시도 한 번만
		// 로그인, 로그아웃, 로그아웃 시에만 수동으로 다시가져올꺼.
		// 자동으로 refetch필요 없으므로 0으로
		staleTime: 0,
		// staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
		// staleTime: 5000, // 5초 캐시 유지
	});
}
