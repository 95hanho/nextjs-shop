import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import { BaseResponse } from "@/types/common";
import { AddCartRequest } from "@/types/product";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddCart() {
	// 1) [store / custom hooks] -------------------------------------------
	const queryClient = useQueryClient();
	const { openDialog } = useGlobalDialogStore();

	return useMutation({
		mutationKey: ["productDetailAddCart"],
		mutationFn: ({ addCartList, productId }: AddCartRequest) =>
			postJson<BaseResponse, AddCartRequest>(getApiUrl(API_URL.PRODUCT_CART), {
				addCartList,
				productId,
			}),
		onSuccess: (data) => {
			// 현재 제품 장바구니 확인
			queryClient.invalidateQueries({ queryKey: ["productCartCheck"] });
			// 유저 정보 갱신 (장바구니 수량)
			queryClient.invalidateQueries({ queryKey: ["me"] });
			if (data.message === "CART_ADD_PARTIAL_SUCCESS") {
				openDialog("ALERT", {
					content:
						"재고 수량보다 많은 수량이 선택된 옵션이 있습니다.<br /> 재고가 있는 수량만 장바구니에 담겼습니다.<br /> 옵션과 수량을 확인해주세요.",
				});
			}
		},
		onError: (err) => {
			console.error("장바구니 담기 실패", err);
			if (err.message === "CART_ADD_OUT_OF_STOCK") {
				openDialog("ALERT", { content: "재고 수량보다 많은 수량이 선택되었습니다.<br /> 옵션과 수량을 확인해주세요." });
			}
		},
	});
}
