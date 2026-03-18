import { ChangeEvent, ChangeSet } from "@/types/event";
import { UserAddress } from "@/types/mypage";
import { createContext } from "react";

export type ShippingAddressMode = "existing" | "new";

interface BuyContextValue {
	defaultAddress: UserAddress | null;
	setDefaultAddress: (address: UserAddress | null) => void;
	shippingAddressMode: ShippingAddressMode;
	setShippingAddressMode: (mode: ShippingAddressMode) => void;
	initMemo: string;
	newAddress: UserAddress;
	changeNewAddress: (e?: ChangeEvent, changeSet?: ChangeSet) => void;
	handleBuy: () => void;
}

export const buyContext = createContext<BuyContextValue | null>(null);
