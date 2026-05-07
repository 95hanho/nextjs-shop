import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { useAuth } from "@/hooks/context/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { useQuery } from "@tanstack/react-query";

export function useGetUserId() {
	const { loginOn } = useAuth();

	return useQuery<BaseResponse & { userId: string }, Error, string>({
		queryKey: ["userInfoUserId"],
		queryFn: () => getNormal(getApiUrl(API_URL.AUTH_ID)),
		enabled: loginOn,
		refetchOnWindowFocus: false,
		select: (data) => {
			return data.userId;
		},
	});
}
