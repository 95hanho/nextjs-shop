import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { useAuth } from "@/hooks/context/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { useQuery } from "@tanstack/react-query";

// 위시 여부 확인
export function useWishCheck(productIdList: number[]) {
	// 1) [store / providers / custom hooks] -------------------------------------------
	const { loginOn } = useAuth();

	return useQuery<BaseResponse & { checkedProductIdList: number[] }, Error, number[]>({
		queryKey: ["wishCheck", productIdList],
		queryFn: () => getNormal(getApiUrl(API_URL.PRODUCT_WISH_CHECK), { productIdList }),
		enabled: loginOn, // 로그인 했을 때만 실행
		select: (data) => data.checkedProductIdList,
	});
}
