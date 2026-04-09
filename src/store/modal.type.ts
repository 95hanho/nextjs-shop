import { AddressForm } from "@/components/modal/domain/ShippingAddressEditorModal";
import { CartItem, UserAddressListItem } from "@/types/mypage";
import { AddCouponRequest, SellerCoupon, UpdateCouponRequest } from "@/types/seller";

// -- modal타입
// dialog.type.ts
export type DialogType = "ALERT" | "CONFIRM" | null;
// modal.type.ts
export type DomainModalType = "PRODUCT_OPTION" | "ADDRESS_SET" | "BUY_ADDRESSLIST" | "SELLER_COUPON" | null;

// -- modal이 닫힐 때 동작 구분
export type DialogCloseResult = "NEED_LOGIN_CANCEL" | "SELLER_LOGOUT" | "CART_DELETE_CANCEL";
export type DomainModalCloseResult = "PRODUCT_OPTION_CHANGE_CANCEL";

// 모달 오픈 시 공통 옵션
type ModalCommon = {
	disableOverlayClose?: boolean;
	disableEscClose?: boolean;
	handleAfterClose?: () => void;
};
type DialogCommon = ModalCommon & {
	closeResult?: DialogCloseResult;
};
type DomainModalCommon = ModalCommon & {
	closeResult?: DomainModalCloseResult;
};

/** confirm 모달에서 ok 눌렀을 때, “어떤 상황인지”에 대한 결과값 */
export type ConfirmOkResult =
	| "NEED_LOGIN" // RootProvider - 로그인 필요
	| "ADDCART" // 상품상세조회 - 추가로 담으시겠습니까?
	| "ADDRESS_DEFAULT_CHANGE" // 마이페이지 - 배송주소 기본값 변경
	| "ADDRESS_DELETE" // 마이페이지 - 배송주소 삭제
	| "COUPON_STATUS_CHANGE" // 판매자페이지 - 쿠폰 상태 변경
	| "SELLER_COUPON_DELETE_OK"; // 판매자페이지 - 쿠폰 삭제 확인
export type ConfirmCancelResult = string; // 아직 사용하는 대가 없어서 string으로 둠

// -- modal이 열릴 떄 요구되는 옵션
// -- modalType별로 요구하는 modalProps를 정확히 매핑
export type DialogPropsMap = {
	ALERT: DialogCommon & {
		content: string;
		title?: string;
	};
	CONFIRM: DialogCommon & {
		content: string;
		title?: string;
		okText?: string;
		okResult?: ConfirmOkResult;
		cancelText?: string;
		cancelResult?: ConfirmCancelResult;
		hideCancel?: boolean;
		reverse?: boolean;
	};
};
export type DomainModalPropsMap = {
	PRODUCT_OPTION: DomainModalCommon & {
		product: CartItem;
	};
	ADDRESS_SET: DomainModalCommon & {
		address?: UserAddressListItem;
	};
	BUY_ADDRESSLIST: DomainModalCommon & {};
	SELLER_COUPON: DomainModalCommon & {
		coupon?: SellerCoupon;
	};
};
// -- modal이 열릴 때 요구되는 옵션
export type OpenDomainModal = <T extends Exclude<DomainModalType, null>>(type: T, props: DomainModalPropsMap[T]) => void;
export type OpenDialog = <T extends Exclude<DialogType, null>>(type: T, props: DialogPropsMap[T]) => void;

export type DialogProps<T extends DialogType = DialogType> = T extends null ? Record<string, never> : DialogPropsMap[Exclude<T, null>];
export type DomainModalProps<T extends DomainModalType = DomainModalType> = T extends null
	? Record<string, never>
	: DomainModalPropsMap[Exclude<T, null>];

// -- 모달이 닫힐 때 “무슨 동작이었는지”에 따른 “전달할 데이터”
export type DialogResultMap = {
	ALERT_OK: undefined;
	// Confirm ok
	CONFIRM_OK:
		| undefined
		| {
				result: ConfirmOkResult;
		  };
	// Confirm cancel
	CONFIRM_CANCEL:
		| undefined
		| {
				result: ConfirmCancelResult;
		  };
	DIALOG_CLOSE:
		| undefined
		| {
				result: DialogCloseResult;
		  };
};
export type DomainModalResultMap = {
	// 상품 옵션 변경
	PRODUCT_OPTION_CHANGED: {
		cartId: number;
		originProductOptionId: number;
		productOptionId: number;
		quantity: number;
	};
	// 마이주소 변경
	ADDRESS_SET: AddressForm;
	// 구매)배송지 변경
	BUY_ADDRESS_CHANGE: UserAddressListItem;
	// 판매자 쿠폰 등록/수정
	SELLER_COUPON_SET:
		| {
				addCoupon: AddCouponRequest;
		  }
		| {
				updateCoupon: UpdateCouponRequest;
		  };
	// 판매자 쿠폰 삭제
	SELLER_COUPON_DELETE: {
		couponId: number;
	};
	// 공통) 닫기
	DOMAIN_CLOSE:
		| undefined
		| {
				result: DomainModalCloseResult;
		  };
};

export type DialogResult<K extends keyof DialogResultMap = keyof DialogResultMap> = {
	action: K;
	payload: DialogResultMap[K];
};
export type DomainModalResult<K extends keyof DomainModalResultMap = keyof DomainModalResultMap> = {
	action: K;
	payload: DomainModalResultMap[K];
};
