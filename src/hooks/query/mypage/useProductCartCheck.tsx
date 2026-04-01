import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { useQuery } from "@tanstack/react-query";

export function useProductCartCheck(productId: number) {
	const { loginOn } = useAuth();

	return useQuery<BaseResponse & { hasCart: boolean }, Error, boolean>({
		queryKey: ["productCartCheck", productId],
		queryFn: () => getNormal(getApiUrl(API_URL.PRODUCT_CART), { productId }),
		enabled: loginOn,
		refetchOnWindowFocus: false,
		select: (data) => {
			return data.hasCart;
		},
	});
}
