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
import JoinInput from "../user/JoinInput";
import { ChangeEvent } from "@/types/auth";

interface AddressUpdateModalProps {
	onClose: () => void;
	address: UserAddressListItem;
}
type UpdateAddressFormRefs = {
	addressDetail: HTMLInputElement | null;
	memo: HTMLInputElement | null;
};

const initUpdatedAddressAlert = {
	address: "",
	addressDetail: "",
	memo: "",
};

export default function AddressUpdateModal({ onClose, address }: AddressUpdateModalProps) {
	const { resolveModal } = useModalStore();

	const [updatedAddress, setUpdatedAddress] = useState<UserAddressListItem | null>(null);
	const changeUpdatedAddress = (e: ChangeEvent) => {
		let { name, value } = e.target as {
			name: keyof UserAddressListItem;
			value: string;
		};
	};
	const [updatedAddressFailAlert, setUpdatedAddressFailAlert] = useState(initUpdatedAddressAlert);
	const updatedAddressFormRefs = useRef<Partial<UpdateAddressFormRefs>>({});
	useEffect(() => {
		if (address) {
			console.log(address);
			setUpdatedAddress({
				...address,
			});
		}
	}, [address]);

	// 주소API 팝업 띄우기
	const addressPopup = () => {
		new window.daum.Postcode({
			oncomplete: (data) => {
				if (!data) return;
				const fullAddress = data.roadAddress || data.jibunAddress;
				setUpdatedAddress((prev) => {
					const updated = prev as UserAddressListItem;
					return {
						...updated,
						zonecode: data.zonecode,
						address: fullAddress,
					};
				});
			},
		}).open({
			popupKey: "addpopup2",
		});
	};

	if (!updatedAddress) return null;
	return (
		<div id="addressUpdateModal" className="modal-wrap">
			<header className="modal-header">배송지 수정</header>
			<button className="modal-close" onClick={onClose}>
				<BsXLg />
			</button>
			{/*  */}
			<div className="modal-content address">
				<div className="address-input">
					<JoinInput
						name="address"
						label="주소"
						placeholder="주소를 입력해주세요."
						value={updatedAddress.address}
						failMessage={updatedAddressFailAlert.address}
						readOnly
						onClick={addressPopup}
						searchBtn={{ txt: "검색", fnc: addressPopup }}
					/>
					<JoinInput
						name="address"
						label="주소"
						placeholder="주소를 입력해주세요."
						value={updatedAddress.address}
						failMessage={updatedAddressFailAlert.address}
						readOnly
						onClick={addressPopup}
						searchBtn={{ txt: "검색", fnc: addressPopup }}
					/>
					<JoinInput
						name="addressDetail"
						label="상세주소"
						placeholder="상세주소를 입력해주세요."
						value={updatedAddress.addressDetail}
						failMessage={updatedAddressFailAlert.addressDetail}
						onChange={changeUpdatedAddress}
						ref={(el) => {
							updatedAddressFormRefs.current.addressDetail = el;
						}}
					/>
				</div>
				{/* 위: 옵션 드롭다운 + 리스트 */}
				<div className="option-block">
					<div className="option-memo">
						<span>메모</span>
						<span>
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
						</span>
					</div>
					<div className="address-write">
						<JoinInput
							name="memo"
							label="직접입력"
							placeholder="메모를 입력해주세요."
							value={updatedAddress.memo}
							failMessage={updatedAddressFailAlert.memo}
							onChange={changeUpdatedAddress}
							ref={(el) => {
								updatedAddressFormRefs.current.memo = el;
							}}
						/>
					</div>
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
