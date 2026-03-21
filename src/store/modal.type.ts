import { AddressForm } from "@/components/modal/domain/ShippingAddressEditorModal";
import { CartItem, UserAddressListItem } from "@/types/mypage";

// modal타입
export type ModalType = "ALERT" | "CONFIRM" | "PRODUCT_OPTION" | "ADDRESS_SET" | "BUY_ADDRESSLIST" | null;
//
export type CloseResult = "NEED_LOGIN_CANCEL" | "SELLER_LOGOUT";
/** confirm 모달에서 ok 눌렀을 때, “어떤 상황인지”에 대한 결과값 */
export type ConfirmOkResult =
	| "NEED_LOGIN" // RootProvider - 로그인 필요
	| "ADDCART" // 상품상세조회 - 추가로 담으시겠습니까?
	| "ADDRESS_DEFAULT_CHANGE" // 마이페이지 - 배송주소 기본값 변경
	| "ADDRESS_DELETE"; // 마이페이지 - 배송주소 삭제
export type ConfirmCancelResult = string;
//
type ModalCommon = {
	disableOverlayClose?: boolean;
	disableEscClose?: boolean;
	closeResult?: CloseResult;
};
// modal이 열릴 떄 요구되는 옵션
// modalType별로 요구하는 modalProps를 정확히 매핑
export type ModalPropsMap = {
	ALERT: ModalCommon & {
		content: string;
		title?: string;
	};
	CONFIRM: ModalCommon & {
		content: string;
		title?: string;
		okText?: string;
		okResult?: ConfirmOkResult;
		cancelText?: string;
		cancelResult?: ConfirmCancelResult;
		hideCancel?: boolean;
		reverse?: boolean;
	};
	PRODUCT_OPTION: ModalCommon & {
		product: CartItem;
	};
	ADDRESS_SET: ModalCommon & {
		address?: UserAddressListItem;
	};
	BUY_ADDRESSLIST: ModalCommon & {};
};

export type ModalProps<T extends ModalType = ModalType> = T extends null ? Record<string, never> : ModalPropsMap[Exclude<T, null>];
// 모달이 닫힐 때 “무슨 동작이었는지”에 따른 “전달할 데이터”
export type ModalResultMap = {
	PRODUCT_OPTION_CHANGED: {
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
				result: ConfirmOkResult;
		  };
	CONFIRM_CANCEL:
		| undefined
		| {
				result: ConfirmCancelResult;
		  };
	ALERT_OK: undefined;
	CLOSE:
		| undefined
		| {
				result: CloseResult;
		  };
};

export type ModalResult<K extends keyof ModalResultMap = keyof ModalResultMap> = {
	action: K;
	payload: ModalResultMap[K];
};
