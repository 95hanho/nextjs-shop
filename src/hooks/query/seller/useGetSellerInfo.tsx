import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { GetSellerInfoResponse } from "@/types/seller";
import { useQuery } from "@tanstack/react-query";

export function useGetSellerInfo() {
	const { seller: initialSeller, setSeller } = useSellerAuth();

	return useQuery({
		queryKey: ["sellerInfo"],
		queryFn: async () => {
			const data = await getNormal<GetSellerInfoResponse>(getApiUrl(API_URL.SELLER));
			const seller = data.seller ?? null; // undefined 방지
			// console.log("seller", seller);
			setSeller(seller);
			return seller;
		},
		initialData: initialSeller ?? null,
		retry: 1, // 재시도 한 번만
		// 로그인, 로그아웃, 로그아웃 시에만 수동으로 다시가져올꺼.
		// 자동으로 refetch필요 없으므로 0으로
		staleTime: 0,
		// staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
		// staleTime: 5000, // 5초 캐시 유지
	});
}
