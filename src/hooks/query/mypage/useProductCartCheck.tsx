import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { useMutation } from "@tanstack/react-query";

export function useProductCartCheck() {
	return useMutation<BaseResponse & { hasCart: boolean }, Error, { productId: number }>({
		mutationKey: ["productCartCheck"],
		mutationFn: ({ productId }) => getNormal(getApiUrl(API_URL.PRODUCT_CART), { productId }),
	});
}
