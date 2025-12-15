"use client";

import { useEffect, useRef, useState } from "react";
import { BsXLg } from "react-icons/bs";
import { FaMinus, FaPlus } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import OptionSelector from "../ui/OptionSelector";
import { FiMinus, FiPlus } from "react-icons/fi";
import { CartItem, GetCartOptionProductDetailListResponse } from "@/types/mypage";
import { useQuery } from "@tanstack/react-query";
import API_URL from "@/api/endpoints";
import { getApiUrl } from "@/lib/getBaseUrl";
import { getNormal } from "@/api/fetchFilter";
import { useModalStore } from "@/store/modal.store";

interface ProductOptionModalProps {
	onClose: () => void;
	product: CartItem;
}

export default function ProductOptionModal({ onClose, product }: ProductOptionModalProps) {
	if (!product) return null;
	const { resolveModal } = useModalStore();
	// 제품상세옵션 리스트
	// invalidateQueries(["cartOptionProductDetailList"])
	const {
		data: optionResponse,
		isLoading,
		isFetching,
	} = useQuery<GetCartOptionProductDetailListResponse>({
		queryKey: ["cartOptionProductDetailList", product.productId],
		queryFn: () => getNormal(getApiUrl(API_URL.MY_CART_OPTION_PRODUCT_DETAIL), { productId: product.productId }),
		enabled: !!product?.productId,
	});

	// ✅ 선택된 옵션(productDetailId) 관리
	const [pickId, setPickId] = useState<number>(product.productDetailId);
	//
	const [productCount, setProductCount] = useState<number>(product.quantity);
	// 원래 선택된 옵션과 같은지
	const isSameOption = () => {
		return pickId === product.productDetailId && productCount === product.quantity ? " off" : "";
	};

	// ✅ optionResponse 들어오면, pickId가 없거나 유효하지 않을 때 기본값 보정
	useEffect(() => {
		const list = optionResponse?.cartOptionProductDetailList;
		if (!list || list.length === 0) return;

		const exists = list.some((d) => d.productDetailId === pickId);
		if (!exists) setPickId(product.productDetailId);
	}, [optionResponse, product.productDetailId, pickId]);

	const optionSelectorEle = () => {
		// 1) 로딩 중(최초)
		const addPriceMark = product.addPrice > 0 ? `(+${product.addPrice})` : "";
		if (isLoading) {
			return (
				<OptionSelector
					optionSelectorName="productVisualOption"
					initData={{
						id: product.productDetailId,
						val: `${product.size}(+${product.addPrice})`,
					}}
				/>
			);
		}

		// 2) 데이터 없음/비정상
		const productDetailList = optionResponse?.cartOptionProductDetailList ?? [];
		if (productDetailList.length === 0) {
			return (
				<OptionSelector
					optionSelectorName="productVisualOption"
					initData={{
						id: product.productDetailId,
						val: `${product.size}(+${product.addPrice})`,
					}}
				/>
			);
		}

		// 3) 정상 데이터
		const optionList = productDetailList.map((detail) => {
			const addPriceMark = detail.addPrice > 0 ? `(+${detail.addPrice})` : "";
			return {
				id: detail.productDetailId,
				val: `${detail.size}${addPriceMark}`,
				description: "내일(금) 출고 예정",
			};
		});

		const pickIdx = Math.max(
			0,
			optionList.findIndex((v) => v.id === pickId)
		);

		return (
			<OptionSelector
				optionSelectorName="productVisualOption"
				initData={{
					id: product.productDetailId,
					val: `${product.size}${addPriceMark}`,
				}}
				pickIdx={pickIdx}
				optionList={optionList}
				changeOption={(id) => {
					setPickId(id);
				}}
				// 필요하면 fetching 표시용 prop 추가해서 skeleton/disabled 처리 가능
				// disabled={isFetching}
			/>
		);
	};

	return (
		<div id="productOptionModal" className="modal-wrap">
			<header className="modal-header"></header>
			<button className="modal-close" onClick={onClose}>
				<BsXLg />
			</button>
			{/*  */}
			<div className="modal-content">
				{/* 위: 옵션 드롭다운 + 리스트 */}
				<div className="option-block">{optionSelectorEle()}</div>
				{/* 수량/금액 */}
				<div className="option-summary">
					<div className="option-summary__counter">
						<button
							className={`option-summary__btn${productCount === 1 ? " off" : ""}`}
							onClick={() => {
								if (productCount > 1) setProductCount(productCount - 1);
							}}
						>
							<FiMinus />
						</button>
						<span className="option-summary__qty">{productCount}</span>
						<button
							className={`option-summary__btn${productCount === product.stock ? " off" : ""}`}
							onClick={() => {
								if (productCount < product.stock) setProductCount(productCount + 1);
							}}
						>
							<FiPlus />
						</button>
					</div>
					<b className="option-summary__price">62,100원</b>
				</div>
				{/* 버튼 */}
				<div className="option-actions">
					<button className="option-actions__cancel" onClick={onClose}>
						취소
					</button>
					<button
						className={`option-actions__submit${isSameOption()}`}
						onClick={() => {
							resolveModal({
								action: "PRODUCTOPTION_CHANGED",
								payload: {
									cartId: product.cartId,
									originProductDetailId: product.productDetailId,
									productDetailId: pickId,
									quantity: productCount,
								},
							});
						}}
					>
						변경하기
					</button>
				</div>
			</div>
		</div>
	);
}
