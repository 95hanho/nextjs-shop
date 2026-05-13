import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { useSellerAuth } from "@/hooks/context/useSellerAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { GetSellerCouponListResponse, SellerCoupon } from "@/types/seller";
import { useQuery } from "@tanstack/react-query";

// 판매자 쿠폰 리스트 조회
export function useGetSellerCouponList() {
	// 1) [store / providers / custom hooks] -------------------------------------------
	const { loginOn } = useSellerAuth();

	return useQuery<GetSellerCouponListResponse, Error, SellerCoupon[]>({
		queryKey: ["sellerCouponList"],
		queryFn: () => getNormal(getApiUrl(API_URL.SELLER_COUPON)),
		select: (data) => {
			return data.couponList;
		},
		enabled: loginOn,
		refetchOnWindowFocus: false,
	});
}
