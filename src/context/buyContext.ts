import { ChangeEvent } from "@/types/event";
import { FormInputAlarm, FormInputRefs } from "@/types/form";
import { UserAddress } from "@/types/mypage";
import { createContext } from "react";

export type ShippingAddressMode = "existing" | "new";

export type AddressAlarm = FormInputAlarm<keyof UserAddress>;
export type AddressFormFormInputRefs = FormInputRefs<keyof UserAddress>;

interface BuyContextValue {
	shippingAddress: UserAddress | null;
	setShippingAddress: React.Dispatch<React.SetStateAction<UserAddress | null>>;
	currentDefaultStatus: boolean;
	setAsDefault: boolean;
	setSetAsDefault: React.Dispatch<React.SetStateAction<boolean>>;
	shippingAddressMode: ShippingAddressMode;
	setShippingAddressMode: React.Dispatch<React.SetStateAction<ShippingAddressMode>>;
	shippingMemo: string;
	newAddress: UserAddress;
	addressAlarm: AddressAlarm | null;
	setAddressAlarm: React.Dispatch<React.SetStateAction<AddressAlarm | null>>;
	addressFormInputRefs: React.MutableRefObject<Partial<AddressFormFormInputRefs>>;
	usedMileage: number;
	setUsedMileage: React.Dispatch<React.SetStateAction<number>>;
	paymentMethod: "CARD" | "CASH" | null;
	setPaymentMethod: React.Dispatch<React.SetStateAction<"CARD" | "CASH" | null>>;
	changeNewAddress: (e?: ChangeEvent, changeMap?: Partial<UserAddress>) => void;
	validateNewAddress: (e: ChangeEvent) => void;
	changeUsedMileage: (e: ChangeEvent, availableMileage: number) => void;
	handleBuy: () => void;
}

export const buyContext = createContext<BuyContextValue | null>(null);
