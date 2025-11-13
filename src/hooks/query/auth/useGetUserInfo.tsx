"use client";

import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import useAuth from "@/hooks/useAuth";
import { getBaseUrl } from "@/lib/getBaseUrl";
import { UserResponse } from "@/types/auth";
import { useQuery } from "@tanstack/react-query";

export function useGetUserInfo() {
	const { user: initialUser, setUser } = useAuth();

	return useQuery({
		queryKey: ["me"],
		queryFn: async () => {
			const data = await getNormal<UserResponse>(getBaseUrl(API_URL.USER));
			setUser(data.user);
			return data.user;
		},
		initialData: initialUser,
		staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
	});
}
