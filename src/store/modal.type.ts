import { AddressForm } from "@/components/modal/AddressModal";
import { CartItem, UserAddressListItem } from "@/types/mypage";

// modal타입
export type ModalType = "ALERT" | "CONFIRM" | "PRODUCTOPTION" | "ADDRESSSET" | null;
type ModalCommon = {
	disableOverlayClose?: boolean;
	disableEscClose?: boolean;
};
// modal이 열릴 떄 요구되는 옵션
/** modalType별로 요구하는 modalProps를 정확히 매핑 */
export type ModalPropsMap = {
	ALERT: ModalCommon & {
		content: string;
		title?: string;
	};
	CONFIRM: ModalCommon & {
		content: string;
		title?: string;
		okText?: string;
		okResult?: string;
		cancelText?: string;
		cancelResult?: string;
	};
	PRODUCTOPTION: ModalCommon & {
		product: CartItem;
	};
	ADDRESSSET: ModalCommon & {
		address?: UserAddressListItem;
	};
};

export type ModalProps<T extends ModalType = ModalType> = T extends null ? {} : ModalPropsMap[Exclude<T, null>];
// 모달이 닫힐 때 “무슨 동작이었는지”에 따른 “전달할 데이터”
export type ModalResultMap = {
	PRODUCTOPTION_CHANGED: {
		cartId: number;
		originProductOptionId: number;
		productOptionId: number;
		quantity: number;
	};
	//
	ADDRESS_SET: AddressForm;
	/*  */
	CONFIRM_OK:
		| undefined
		| {
				result: string;
		  };
	CONFIRM_CANCEL:
		| undefined
		| {
				result: string;
		  };
	ALERT_OK: undefined;
	CLOSE: undefined;
};

export type ModalResult<K extends keyof ModalResultMap = keyof ModalResultMap> = {
	action: K;
	payload: ModalResultMap[K];
};
