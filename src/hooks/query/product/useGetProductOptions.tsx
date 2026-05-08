import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import { GetProductOptionListResponse, ProductOption } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

// 제품상세보기 옵션 조회
export function useGetProductOptions(productId: number, initialData?: ProductOption[]) {
	return useQuery<GetProductOptionListResponse, Error, ProductOption[]>({
		queryKey: ["productOptionList", productId],
		queryFn: () => getNormal(getApiUrl(API_URL.PRODUCT_DETAIL_OPTION), { productId }),
		enabled: !!productId,
		initialData: { productOptionList: initialData ?? [], message: "SUCCESS" },
		select: (data) => data.productOptionList,
	});
}
