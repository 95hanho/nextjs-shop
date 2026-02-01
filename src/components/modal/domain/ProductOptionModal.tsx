"use client";

import { useEffect, useState } from "react";
import { OptionSelector } from "../../ui/OptionSelector";
import { FiMinus, FiPlus } from "react-icons/fi";
import { CartItem, GetCartOptionProductOptionListResponse } from "@/types/mypage";
import { useQuery } from "@tanstack/react-query";
import API_URL from "@/api/endpoints";
import { getApiUrl } from "@/lib/getBaseUrl";
import { getNormal } from "@/api/fetchFilter";
import { useModalStore } from "@/store/modal.store";
import { ModalFrame } from "@/components/modal/frame/ModalFrame";
import styles from "../Modal.module.scss";
import { ConfirmButton } from "@/components/modal/frame/ConfirmButton";
import clsx from "clsx";

interface ProductOptionModalProps {
	onClose: () => void;
	product: CartItem;
}

export const ProductOptionModal = ({ onClose, product }: ProductOptionModalProps) => {
	const { resolveModal } = useModalStore();
	// 제품상세옵션 리스트
	// invalidateQueries(["cartOptionProductOptionList"])
	const { data: optionResponse, isLoading } = useQuery<GetCartOptionProductOptionListResponse>({
		queryKey: ["cartOptionProductOptionList", product.productId],
		queryFn: () => getNormal(getApiUrl(API_URL.MY_CART_OPTION_PRODUCT_DETAIL), { productId: product.productId }),
		enabled: !!product?.productId,
	});

	// ✅ 선택된 옵션(productOptionId) 관리
	const [pickId, setPickId] = useState<number>(product.productOptionId);
	//
	const [productCount, setProductCount] = useState<number>(product.quantity);

	// ✅ optionResponse 들어오면, pickId가 없거나 유효하지 않을 때 기본값 보정
	useEffect(() => {
		const list = optionResponse?.cartOptionProductOptionList;
		if (!list || list.length === 0) return;

		const exists = list.some((d) => d.productOptionId === pickId);
		if (!exists) setPickId(product.productOptionId);
	}, [optionResponse, product.productOptionId, pickId]);

	const optionSelectorEle = () => {
		// 1) 로딩 중(최초)
		const addPriceMark = product.addPrice > 0 ? `(+${product.addPrice})` : "";
		if (isLoading) {
			return (
				<OptionSelector
					optionSelectorName="productVisualOption"
					initData={{
						id: product.productOptionId,
						val: `${product.size}(+${product.addPrice})`,
					}}
				/>
			);
		}

		// 2) 데이터 없음/비정상
		const productOptionList = optionResponse?.cartOptionProductOptionList ?? [];
		if (productOptionList.length === 0) {
			return (
				<OptionSelector
					optionSelectorName="productVisualOption"
					initData={{
						id: product.productOptionId,
						val: `${product.size}(+${product.addPrice})`,
					}}
				/>
			);
		}

		// 3) 정상 데이터
		const optionList = productOptionList.map((detail) => {
			const addPriceMark = detail.addPrice > 0 ? `(+${detail.addPrice})` : "";
			return {
				id: detail.productOptionId,
				val: `${detail.size}${addPriceMark}`,
				description: "내일(금) 출고 예정",
			};
		});

		const pickIdx = Math.max(
			0,
			optionList.findIndex((v) => v.id === pickId),
		);

		return (
			<OptionSelector
				optionSelectorName="productVisualOption"
				initData={{
					id: product.productOptionId,
					val: `${product.size}${addPriceMark}`,
				}}
				pickIdx={pickIdx}
				optionList={optionList}
				changeOption={(_, id) => {
					setPickId(id);
				}}
				// 필요하면 fetching 표시용 prop 추가해서 skeleton/disabled 처리 가능
				// disabled={isFetching}
			/>
		);
	};

	if (!product) return null;
	return (
		<ModalFrame title="" onClose={onClose} modalWrapVariant="productOption">
			{/*  */}
			{/* 위: 옵션 드롭다운 + 리스트 */}
			<div className={styles.optionBlock}>{optionSelectorEle()}</div>
			{/* 수량/금액 */}
			<div className={styles.optionSummary}>
				<div className={styles.optionSummaryCounter}>
					<button
						className={clsx([styles.optionSummaryBtn, `${productCount === 1 && styles.off}`])}
						onClick={() => {
							if (productCount > 1) setProductCount(productCount - 1);
						}}
					>
						<FiMinus />
					</button>
					<span className={styles.optionSummaryQty}>{productCount}</span>
					<button
						className={clsx([styles.optionSummaryBtn, `${productCount === product.stock && styles.off}`])}
						onClick={() => {
							if (productCount < product.stock) setProductCount(productCount + 1);
						}}
					>
						<FiPlus />
					</button>
				</div>
				<b className={styles.optionSummaryPrice}>62,100원</b>
			</div>
			{/* 버튼 */}
			<ConfirmButton
				{...{
					confirmText: "변경하기",
					onCancel: () => {
						onClose();
					},
					onConfirm: () => {
						resolveModal({
							action: "PRODUCTOPTION_CHANGED",
							payload: {
								cartId: product.cartId,
								originProductOptionId: product.productOptionId,
								productOptionId: pickId,
								quantity: productCount,
							},
						});
					},
					confirmDisabled: pickId === product.productOptionId && productCount === product.quantity,
				}}
			/>
		</ModalFrame>
	);
};
