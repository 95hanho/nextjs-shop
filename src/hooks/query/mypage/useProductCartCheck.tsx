import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { useMutation } from "@tanstack/react-query";

// 장바구니 확인 훅(특정 제품이 장바구니에 담겨있는지 확인)
export function useProductCartCheck() {
	return useMutation<BaseResponse & { hasCart: boolean }, Error, { productId: number }>({
		mutationKey: ["productCartCheck"],
		mutationFn: ({ productId }) => getNormal(getApiUrl(API_URL.PRODUCT_CART), { productId }),
	});
}
