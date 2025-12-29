"use client";

import { useEffect, useRef, useState } from "react";
import { BsXLg } from "react-icons/bs";
import { FaMinus, FaPlus } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import OptionSelector from "../ui/OptionSelector";
import { FiMinus, FiPlus } from "react-icons/fi";
import { CartItem, GetCartOptionProductDetailListResponse, UserAddressListItem } from "@/types/mypage";
import { useQuery } from "@tanstack/react-query";
import API_URL from "@/api/endpoints";
import { getApiUrl } from "@/lib/getBaseUrl";
import { getNormal } from "@/api/fetchFilter";
import { useModalStore } from "@/store/modal.store";

interface AddressUpdateModalProps {
	onClose: () => void;
	address: UserAddressListItem;
}

export default function AddressUpdateModal({ onClose, address }: AddressUpdateModalProps) {
	const { resolveModal } = useModalStore();

	if (!address) return null;
	return (
		<div id="addressUpdateModal" className="modal-wrap">
			<header className="modal-header"></header>
			<button className="modal-close" onClick={onClose}>
				<BsXLg />
			</button>
			{/*  */}
			<div className="modal-content">
				{/* 위: 옵션 드롭다운 + 리스트 */}
				<div className="option-block">
					<OptionSelector
						optionSelectorName="deliveryMemo"
						pickIdx={0}
						initData={{
							id: 1,
							val: "문 앞에 놓아주세요",
						}}
						optionList={[
							{ id: 1, val: "문 앞에 놓아주세요" },
							{ id: 2, val: "경비실에 맡겨주세요" },
							{ id: 3, val: "부재 시 전화 주세요" },
							{ id: 4, val: "배송 전 연락 바랍니다" },
							{ id: 5, val: "직접 입력" },
						]}
						changeOption={(id) => {}}
					/>
				</div>
				{/* 버튼 */}
				<div className="option-actions">
					<button className="option-actions__cancel" onClick={onClose}>
						취소
					</button>
					<button
						className={`option-actions__submit`}
						onClick={() => {
							resolveModal({
								action: "PRODUCTOPTION_CHANGED",
								payload: {
									...address,
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
