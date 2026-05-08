import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useQuery } from "@tanstack/react-query";

// 쿠폰 이름 중복 확인
export function useSellerCouponDescriptionDuplicate(description: string) {
	const trimmedDescription = description.trim();

	return useQuery({
		queryKey: ["sellerCouponDescriptionDuplicate", trimmedDescription],
		queryFn: () => getNormal(getApiUrl(API_URL.SELLER_COUPON_DESCRIPTION_DUPLICATE), { description: trimmedDescription }),
		enabled: false,
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
	});
}
