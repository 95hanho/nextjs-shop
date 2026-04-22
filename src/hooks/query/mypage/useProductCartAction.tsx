import { useAddCart } from "@/hooks/query/mypage/useAddCart";
import { useProductCartCheck } from "@/hooks/query/mypage/useProductCartCheck";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import { AddCartItem } from "@/types/product";

/** 장바구니 담기 */
export function useProductCartAction() {
	// 1) [store / custom hooks] -------------------------------------------
	const { mutateAsync: checkProductCart } = useProductCartCheck();
	const { openDialog } = useGlobalDialogStore();
	const addCartMutation = useAddCart();

	// 5) [handlers / useCallback] -----------------------------------------
	// 장바구니 담기 버튼
	const handleAddCart = async (addCartList: AddCartItem[], productId: number) => {
		if (addCartList.length === 0) {
			openDialog("ALERT", { content: "옵션을 선택해주세요." });
			return;
		}
		const checkProductCartData = await checkProductCart({ productId });

		if (checkProductCartData.hasCart) {
			openDialog("CONFIRM", {
				content: "이미 장바구니에 담긴 상품입니다. 추가로 담으시겠습니까?",
				okText: "추가 담기",
				reverse: true,
				handleAfterOk: () => {
					addCartMutation.mutate({ addCartList, productId }); // 모달 결과에 따라 저장된 옵션으로 장바구니 담기
				},
			});
			return;
		}
		addCartMutation.mutate({ addCartList, productId });
	};

	return {
		handleAddCart,
		...addCartMutation,
	};
}
