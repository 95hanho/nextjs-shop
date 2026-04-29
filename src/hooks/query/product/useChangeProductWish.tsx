import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { useMutation } from "@tanstack/react-query";

export function useChangeProductWish() {
	return useMutation({
		mutationKey: ["changeProductWish"],
		mutationFn: (productId: number) => postJson<BaseResponse>(getApiUrl(API_URL.PRODUCT_WISH), { productId }),
		onSuccess: (data) => {
			console.log(data);
		},
		onError: (err) => {
			console.log(err);
		},
	});
}
