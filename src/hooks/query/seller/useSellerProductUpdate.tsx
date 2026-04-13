import API_URL from "@/api/endpoints";
import { putJson } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import { UpdateSellerProductRequest } from "@/types/seller";
import { useMutation } from "@tanstack/react-query";

// 판매자 제품 수정 훅
export function useSellerProductUpdate() {
	return useMutation({
		mutationFn: (productForm: UpdateSellerProductRequest) => putJson(getApiUrl(API_URL.SELLER_PRODUCT), { ...productForm }),
	});
}
