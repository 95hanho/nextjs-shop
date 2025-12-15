import { CartItem } from "@/types/mypage";

// modal타입
export type ModalType = "ALERT" | "CONFIRM" | "PRODUCTOPTION" | null;

/** modalType별로 요구하는 modalProps를 정확히 매핑 */
export type ModalPropsMap = {
	ALERT: {
		content: string;
		title?: string;
	};
	CONFIRM: {
		content: string;
		title?: string;
		okText?: string;
		cancelText?: string;
		cancelResult?: boolean;
	};
	PRODUCTOPTION: {
		product: CartItem;
	};
};

export type ModalProps<T extends ModalType = ModalType> = T extends null ? {} : ModalPropsMap[Exclude<T, null>];
// 모달이 닫힐 때 “무슨 동작이었는지”에 따른 “전달할 데이터”
export type ModalResultMap = {
	PRODUCTOPTION_CHANGED: {
		cartId: number;
		originProductDetailId: number;
		productDetailId: number;
		quantity: number;
	};
	/*  */
	CONFIRM_OK: undefined;
	CONFIRM_CANCEL: undefined;
	ALERT_OK: undefined;
	CLOSE: undefined;
};

export type ModalResult<K extends keyof ModalResultMap = keyof ModalResultMap> = {
	action: K;
	payload: ModalResultMap[K];
};
