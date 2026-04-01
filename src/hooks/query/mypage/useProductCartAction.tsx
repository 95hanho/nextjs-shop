import { useAddCart } from "@/hooks/query/mypage/useAddCart";
import { useProductCartCheck } from "@/hooks/query/mypage/useProductCartCheck";
import { useModalStore } from "@/store/modal.store";
import { ModalResultMap } from "@/store/modal.type";
import { AddCartItem, AddCartRequest } from "@/types/product";
import { useEffect, useRef } from "react";

/** 장바구니 담기 */
export function useProductCartAction() {
	const { mutateAsync: checkProductCart } = useProductCartCheck();
	const { openModal, modalResult, clearModalResult } = useModalStore();
	const addCartMutation = useAddCart();

	const storeAddCartRequest = useRef<AddCartRequest | null>(null);

	// 장바구니 담기 버튼
	const handleAddCart = async (addCartList: AddCartItem[], productId: number) => {
		if (addCartList.length === 0) {
			openModal("ALERT", { content: "옵션을 선택해주세요." });
			return;
		}
		const checkProductCartData = await checkProductCart({ productId });

		if (checkProductCartData.hasCart) {
			storeAddCartRequest.current = { addCartList, productId }; // 모달 결과를 기다리기 전에 선택한 옵션 저장
			openModal("CONFIRM", {
				content: "이미 장바구니에 담긴 상품입니다. 추가로 담으시겠습니까?",
				okText: "추가 담기",
				okResult: "ADDCART",
				reverse: true,
			});
			return;
		}
		addCartMutation.mutate({ addCartList, productId });
	};
	// 장바구니 담기 모달 결과 처리
	useEffect(() => {
		if (!modalResult) return;

		if (modalResult?.action === "CONFIRM_OK") {
			const payload = modalResult.payload as ModalResultMap["CONFIRM_OK"];
			// 장바구니 담기
			if (payload?.result === "ADDCART") {
				addCartMutation.mutate(storeAddCartRequest.current!); // 모달 결과에 따라 저장된 옵션으로 장바구니 담기
				storeAddCartRequest.current = null; // 담기 후 저장된 옵션 초기화
			}
		}
		clearModalResult();
	}, [modalResult, clearModalResult, addCartMutation]);

	return {
		handleAddCart,
		...addCartMutation,
	};
}
