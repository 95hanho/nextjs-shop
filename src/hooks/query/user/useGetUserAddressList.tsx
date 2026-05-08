import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { useAuth } from "@/hooks/context/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { GetUserAddressListResponse, UserAddressListItem } from "@/types/mypage";
import { useQuery } from "@tanstack/react-query";

// 유저 주소 리스트 조회
export function useGetUserAddressList() {
	// 1) [store / custom hooks] -------------------------------------------
	const { loginOn } = useAuth();

	return useQuery<GetUserAddressListResponse, Error, UserAddressListItem[]>({
		queryKey: ["userAddressList"],
		queryFn: () => getNormal(getApiUrl(API_URL.MY_ADDRESS)),
		select: (data) => data.userAddressList,
		enabled: loginOn,
	});
}
