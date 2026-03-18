"use client";

import { ShippingAddressMode } from "@/context/buyContext";
import { ChangeEvent, ChangeSet } from "@/types/event";
import { UserAddress } from "@/types/mypage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { buyContext } from "@/context/buyContext";

interface BuyProviderProps {
	children: React.ReactNode;
	defaultAddress?: UserAddress | null;
}

export const BuyProvider = ({ children, defaultAddress: initialDefaultAddress = null }: BuyProviderProps) => {
	// ----------------------------------------------------------------
	// React
	// ----------------------------------------------------------------

	const [defaultAddress, setDefaultAddress] = useState<UserAddress | null>(initialDefaultAddress);
	const [shippingAddressMode, setShippingAddressMode] = useState<ShippingAddressMode>(initialDefaultAddress ? "existing" : "new");
	const [initMemo, setInitMemo] = useState(initialDefaultAddress ? initialDefaultAddress.memo : ""); // 기존 배송지가 있으면 그 메모를 기본값으로, 없으면 빈 문자열
	const [newAddress, setNewAddress] = useState<UserAddress>({
		addressId: 0,
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

	// 결제하기
	const handleBuy = useCallback(() => {
		let address: UserAddress = {} as UserAddress;
		if (shippingAddressMode === "existing" && defaultAddress) {
			address = {
				...defaultAddress,
				memo: newAddress.memo,
			};
		} else if (shippingAddressMode === "new") {
			address = {
				...newAddress,
			};
		}
		console.log("구매 처리 로직 실행", { address });
	}, [shippingAddressMode, defaultAddress, newAddress]);

	// ----------------------------------------------------------------
	// useEffect & useMemo
	// ----------------------------------------------------------------

	useEffect(() => {
		setDefaultAddress(initialDefaultAddress);
		setShippingAddressMode(initialDefaultAddress ? "existing" : "new");
		setInitMemo(initialDefaultAddress?.memo || "문 앞에 놓아주세요");
	}, [initialDefaultAddress]);

	const value = useMemo(
		() => ({
			defaultAddress,
			setDefaultAddress,
			shippingAddressMode,
			setShippingAddressMode,
			initMemo,
			newAddress,
			changeNewAddress,
			handleBuy,
		}),
		[defaultAddress, shippingAddressMode, initMemo, newAddress, changeNewAddress, handleBuy],
	);

	// 디버깅용 log
	useEffect(() => {
		// if (defaultAddress) console.log({ defaultAddress });
	}, [defaultAddress, shippingAddressMode, newAddress]);

	return <buyContext.Provider value={value}>{children}</buyContext.Provider>;
};
