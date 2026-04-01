import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useModalStore } from "@/store/modal.store";
import { BaseResponse } from "@/types/common";
import { AddCartItem, AddCartRequest } from "@/types/product";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddCart(productId: number) {
	const queryClient = useQueryClient();
	const { openModal } = useModalStore();

	return useMutation({
		mutationKey: ["productDetailAddCart", productId],
		mutationFn: (addCartList: AddCartItem[]) =>
			postJson<BaseResponse, AddCartRequest>(getApiUrl(API_URL.PRODUCT_CART), {
				// addCartList: productSelectList.map((option) => ({
				// 	productOptionId: option.productOptionId,
				// 	quantity: option.quantity,
				// })),
				addCartList,
				productId,
			}),
		onSuccess: (data) => {
			// setCartPopupOpen(true);
			// setCartPopupClose(false);
			// 현재 제품 장바구니 확인
			queryClient.invalidateQueries({ queryKey: ["productCartCheck", productId] });
			// 유저 정보 갱신 (장바구니 수량)
			queryClient.invalidateQueries({ queryKey: ["me"] });
			if (data.message === "CART_ADD_PARTIAL_SUCCESS") {
				openModal("ALERT", {
					content:
						"재고 수량보다 많은 수량이 선택된 옵션이 있습니다.<br /> 재고가 있는 수량만 장바구니에 담겼습니다.<br /> 옵션과 수량을 확인해주세요.",
				});
			}
		},
		onError: (err) => {
			console.error("장바구니 담기 실패", err);
			if (err.message === "CART_ADD_OUT_OF_STOCK") {
				openModal("ALERT", { content: "재고 수량보다 많은 수량이 선택되었습니다.<br /> 옵션과 수량을 확인해주세요." });
			}
		},
		onSettled: () => {
			// setProductSelectList([]);
			// 제품 옵션 리스트 갱신 (재고 수량 반영)
			// queryClient.invalidateQueries({ queryKey: ["productOptions", productId] });
		},
	});
}
