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

interface ProductOptionModalProps {
	onClose: () => void;
	product: CartItem;
}

export default function ProductOptionModal({ onClose, product }: ProductOptionModalProps) {
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

	/*  */
	console.log("optionResponse", optionResponse);

	let [pickId, setPickId] = useState<number>(1);

	const optionSelectorEle = () => {
		if (isLoading) {
			return (
				<OptionSelector
					optionSelectorName="productVisualOption"
					initData={{ id: product.productDetailId, val: `${product.size}(+${product.addPrice})` }}
				/>
			);
		}

		const productDetailList = optionResponse?.cartOptionProductDetailList;
		const optionList = productDetailList?.map((detail) => {
			return {
				id: detail.productDetailId,
				val: `${detail.size}(+${detail.addPrice})`,
				description: "내일(금) 출고 예정",
			};
		});
		const pickIdx = optionList ? optionList.findIndex((v) => v.id === pickId) : 0;

		console.log(optionList);
		console.log(pickIdx);
		return null;
		return (
			<OptionSelector
				optionSelectorName="productVisualOption"
				initData={{ id: product.productDetailId, val: `${product.size}(+${product.addPrice})` }}
				pickIdx={pickIdx}
				optionList={optionList}
				changeOption={(id) => {
					setPickId(id);
				}}
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
						<button className="option-summary__btn off">
							<FiMinus />
						</button>
						<span className="option-summary__qty">1</span>
						<button className="option-summary__btn">
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
					<button className="option-actions__submit off">변경하기</button>
				</div>
			</div>
		</div>
	);
}
