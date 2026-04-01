import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useModalStore } from "@/store/modal.store";
import { BuyHoldRequest, BuyHoldResponse } from "@/types/buy";
import { useMutation } from "@tanstack/react-query";

// 상품 확인 및 점유(바로 구매하기)
export function useProductCheckAndHold(productId: number) {
	const { openModal } = useModalStore();

	return useMutation({
		mutationKey: ["productDetailBuyNow", productId],
		mutationFn: ({ buyList, returnUrl }: BuyHoldRequest) =>
			postJson<BuyHoldResponse, BuyHoldRequest>(getApiUrl(API_URL.BUY_HOLD), {
				buyList,
				returnUrl,
			}),
		onSuccess: (data) => {
			console.log("상품 점유 성공", data);
		},
		onError: (err) => {
			console.error("상품 점유 실패", err);
			if (err.message === "STOCK_HOLD_FAILED") {
				openModal("ALERT", { content: "품절된 상품이 있습니다. 옵션과 수량을 다시 확인해주세요." });
			}
		},
	});
}
