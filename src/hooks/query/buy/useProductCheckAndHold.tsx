import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import { BuyHoldRequest, BuyHoldResponse } from "@/types/buy";
import { useMutation } from "@tanstack/react-query";

// 상품 확인 및 점유(바로 구매하기)
export function useProductCheckAndHold() {
	const { openDialog } = useGlobalDialogStore();

	return useMutation({
		mutationKey: ["productDetailBuyNow"],
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
				openDialog("ALERT", { content: "품절된 상품이 있습니다. 옵션과 수량을 다시 확인해주세요." });
				return;
			}
			openDialog("ALERT", { content: "상품 점유에 실패했습니다. 다시 시도해주세요." });
		},
	});
}
