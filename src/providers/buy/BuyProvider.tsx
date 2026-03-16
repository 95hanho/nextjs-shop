"use client";

import { ChangeEvent, ChangeSet } from "@/types/event";
import { UserAddress } from "@/types/mypage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ShippingAddressMode = "existing" | "new";

interface BuyContextValue {
	defaultAddress: UserAddress | null;
	setDefaultAddress: (address: UserAddress | null) => void;
	shippingAddressMode: ShippingAddressMode;
	setShippingAddressMode: (mode: ShippingAddressMode) => void;
	defaultMemo: string;
	setDefaultMemo: (memo: string) => void;
	newAddress: UserAddress;
	changeNewAddress: (e?: ChangeEvent, changeSet?: ChangeSet) => void;
}

interface BuyProviderProps {
	children: React.ReactNode;
	defaultAddress?: UserAddress | null;
}

const buyContext = createContext<BuyContextValue | null>(null);

export const BuyProvider = ({ children, defaultAddress: initialDefaultAddress = null }: BuyProviderProps) => {
	const [defaultAddress, setDefaultAddress] = useState<UserAddress | null>(initialDefaultAddress);
	const [shippingAddressMode, setShippingAddressMode] = useState<ShippingAddressMode>(initialDefaultAddress ? "existing" : "new");

	const [defaultMemo, setDefaultMemo] = useState(initialDefaultAddress ? initialDefaultAddress.memo : ""); // 기존 배송지가 있으면 그 메모를 기본값으로, 없으면 빈 문자열
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
	const changeNewAddress = (e?: ChangeEvent, changeSet?: ChangeSet) => {
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
	};

	const value = useMemo(
		() => ({
			defaultAddress,
			setDefaultAddress,
			shippingAddressMode,
			setShippingAddressMode,
			defaultMemo,
			setDefaultMemo,
			newAddress,
			changeNewAddress,
		}),
		[defaultAddress, shippingAddressMode, defaultMemo, newAddress],
	);

	useEffect(() => {
		setDefaultAddress(initialDefaultAddress);
		setShippingAddressMode(initialDefaultAddress ? "existing" : "new");
		setDefaultMemo(initialDefaultAddress ? initialDefaultAddress.memo : "");
	}, [initialDefaultAddress]);

	useEffect(() => {
		if (defaultAddress) console.log({ defaultAddress });
	}, [defaultAddress, shippingAddressMode, newAddress]);

	return <buyContext.Provider value={value}>{children}</buyContext.Provider>;
};

export const useBuyContext = () => {
	const context = useContext(buyContext);
	if (!context) {
		throw new Error("useBuyContext must be used within BuyProvider");
	}
	return context;
};
