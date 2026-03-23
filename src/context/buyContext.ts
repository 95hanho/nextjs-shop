import { DefaultAddress } from "@/types/buy";
import { ChangeEvent, ChangeSet } from "@/types/event";
import { UserAddress } from "@/types/mypage";
import { createContext } from "react";

export type ShippingAddressMode = "existing" | "new";

interface BuyContextValue {
	shippingAddress: DefaultAddress | null;
	setShippingAddress: React.Dispatch<React.SetStateAction<DefaultAddress | null>>;
	currentDefaultStatus: boolean;
	setAsDefault: boolean;
	setSetAsDefault: React.Dispatch<React.SetStateAction<boolean>>;
	setCurrentDefaultStatus: React.Dispatch<React.SetStateAction<boolean>>;
	shippingAddressMode: ShippingAddressMode;
	setShippingAddressMode: React.Dispatch<React.SetStateAction<ShippingAddressMode>>;
	shippingMemo: string;
	newAddress: UserAddress;
	changeNewAddress: (e?: ChangeEvent, changeSet?: ChangeSet) => void;
	handleBuy: () => void;
	usedMileage: number;
	setUsedMileage: React.Dispatch<React.SetStateAction<number>>;
	changeUsedMileage: (e: ChangeEvent, availableMileage: number) => void;
	paymentMethod: "CARD" | "CASH";
	setPaymentMethod: React.Dispatch<React.SetStateAction<"CARD" | "CASH">>;
}

export const buyContext = createContext<BuyContextValue | null>(null);
