"use client";

import { ShippingAddressMode } from "@/context/buyContext";
import { ChangeEvent, ChangeSet } from "@/types/event";
import { UserAddress, UserAddressListItem } from "@/types/mypage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buyContext } from "@/context/buyContext";
import { useModalStore } from "@/store/modal.store";
import { DefaultAddress } from "@/types/buy";
interface BuyProviderProps {
	children: React.ReactNode;
	initialDefaultAddress?: DefaultAddress | null;
}

export const BuyProvider = ({ children, initialDefaultAddress = null }: BuyProviderProps) => {
	const { modalResult, clearModalResult } = useModalStore();

	// ----------------------------------------------------------------
	// React
	// ----------------------------------------------------------------

	// 기존 배송지 || 신규배송지
	const [shippingAddress, setShippingAddress] = useState<UserAddress | null>(initialDefaultAddress);
	// 배송지의 기본값 현재 여부
	const [currentDefaultStatus, setCurrentDefaultStatus] = useState<boolean>(false);
	// 기본 배송지로 할지 여부
	const [setAsDefault, setSetAsDefault] = useState<boolean>(false);
	// 모드(기존배송지/신규배송지)
	const [shippingAddressMode, setShippingAddressMode] = useState<ShippingAddressMode>(initialDefaultAddress ? "existing" : "new");
	//
	const [shippingMemo, setShippingMemo] = useState(initialDefaultAddress ? initialDefaultAddress.memo : ""); // 기존 배송지가 있으면 그 메모를 기본값으로, 없으면 빈 문자열
	const [newAddress, setNewAddress] = useState<UserAddress>({
		addressName: "",
		recipientName: "",
		addressPhone: "",
		zonecode: "",
		address: "",
		addressDetail: "",
		memo: "",
	});
	const changeNewAddress = useCallback((e?: ChangeEvent, changeSet?: ChangeSet) => {
		if (changeSet) {
			setNewAddress((prev) => ({
				...prev,
				[changeSet.name]: changeSet.value,
			}));
		} else if (e) {
			setNewAddress((prev) => ({
				...prev,
				[e.target.name]: e.target.value,
			}));
		}
	}, []);
	// 마일리지 사용 금액
	const [usedMileage, setUsedMileage] = useState(0);
	const changeUsedMileage = useCallback((e: ChangeEvent, availableMileage: number) => {
		const numericValue = e.target.value.replace(/[^0-9]/g, "");
		const value = Math.min(Number(numericValue), availableMileage);
		setUsedMileage(value);
	}, []);

	// 결제하기
	const handleBuy = useCallback(() => {
		let address: UserAddress = {} as UserAddress;
		if (shippingAddressMode === "existing" && shippingAddress) {
			address = {
				...shippingAddress,
				memo: newAddress.memo,
			};
		} else if (shippingAddressMode === "new") {
			address = {
				...newAddress,
			};
		}
		console.log("구매 처리 로직 실행", { address, setAsDefault });
	}, [shippingAddressMode, shippingAddress, newAddress, setAsDefault]);

	// ----------------------------------------------------------------
	// useEffect & useMemo
	// ----------------------------------------------------------------

	// 처음 기본 배송지 가져올 때
	useEffect(() => {
		setShippingAddress(initialDefaultAddress);
		setCurrentDefaultStatus(initialDefaultAddress?.defaultAddress || false);
		setShippingAddressMode(initialDefaultAddress ? "existing" : "new");
		setShippingMemo(initialDefaultAddress?.memo || "문 앞에 놓아주세요");
	}, [initialDefaultAddress]);

	// 모달 결과
	useEffect(() => {
		if (!modalResult) return;

		// 구매 배송지 변경
		if (modalResult?.action === "BUY_ADDRESS_CHANGE") {
			const address = modalResult.payload as UserAddressListItem;
			setShippingAddress(address);
			setShippingMemo(address?.memo || "문 앞에 놓아주세요");
			setCurrentDefaultStatus(address?.defaultAddress || false);
			setSetAsDefault(false);
		}
		clearModalResult();
	}, [clearModalResult, modalResult]);

	const value = useMemo(
		() => ({
			shippingAddress,
			setShippingAddress,
			currentDefaultStatus,
			setCurrentDefaultStatus,
			setAsDefault,
			setSetAsDefault,
			shippingAddressMode,
			setShippingAddressMode,
			shippingMemo,
			newAddress,
			changeNewAddress,
			handleBuy,
			usedMileage,
			setUsedMileage,
			changeUsedMileage,
		}),
		[
			shippingAddress,
			currentDefaultStatus,
			setAsDefault,
			shippingAddressMode,
			shippingMemo,
			newAddress,
			changeNewAddress,
			handleBuy,
			usedMileage,
			changeUsedMileage,
		],
	);

	// 디버깅용 log
	useEffect(() => {
		// if (shippingAddress) console.log({ shippingAddress });
	}, [shippingAddress, shippingAddressMode, newAddress, usedMileage]);

	return <buyContext.Provider value={value}>{children}</buyContext.Provider>;
};
