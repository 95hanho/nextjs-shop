import { AddressForm } from "@/components/modal/domain/ShippingAddressEditorModal";
import { CartItem, UserAddressListItem } from "@/types/mypage";
import {
	AddCouponRequest,
	AddProductOptionBase,
	SellerCoupon,
	SellerProductOption,
	UpdateCouponRequest,
	UpdateSellerProductOptionRequest,
} from "@/types/seller";

// -- modal타입
// dialog modal 타입 종류 - 모달 오픈 시 종류
export type DialogType = "ALERT" | "CONFIRM" | null;
// domain modal 타입 종류 - 모달 오픈 시 종류
export type DomainModalType =
	| "PRODUCT_REVIEW"
	| "PRODUCT_OPTION"
	| "ADDRESS_SET"
	| "BUY_ADDRESSLIST"
	| "SELLER_COUPON"
	| "SELLER_PRODUCT_OPTION"
	| null;

// -- modal이 닫힐 때 동작 구분
export type DialogCloseResult = "NEED_LOGIN_CANCEL" | "SELLER_LOGOUT";
export type DomainModalCloseResult = "";

// 모달 오픈 시 공통 옵션
type ModalCommon = {
	disableOverlayClose?: boolean;
	disableEscClose?: boolean;
	handleAfterClose?: () => void | Promise<void>;
};
type DialogCommon = ModalCommon & {
	closeResult?: DialogCloseResult;
};
type DomainModalCommon = ModalCommon & {
	closeResult?: DomainModalCloseResult;
};

/** confirm 모달에서 ok 눌렀을 때, “어떤 상황인지”에 대한 결과값 */
export type ConfirmOkResult = "NEED_LOGIN"; // RootProvider - 로그인 필요
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
		handleAfterOk?: () => void | Promise<void>;
	};
};
// modal 열릴 때 넣어주는 props의 타입
export type DomainModalPropsMap = {
	PRODUCT_REVIEW: DomainModalCommon & {
		reviewImageId: number;
	};
	PRODUCT_OPTION: DomainModalCommon & {
		product: CartItem;
		handleAfterCartProductOptionChange: (cartProductOption: {
			cartId: number;
			originProductOptionId: number;
			productOptionId: number;
			quantity: number;
		}) => void | Promise<void>;
	};
	ADDRESS_SET: DomainModalCommon & {
		prevAddress?: UserAddressListItem;
		handleAfterSetAddress: (nextAddress: AddressForm) => void | Promise<void>;
	};
	BUY_ADDRESSLIST: DomainModalCommon & {
		handleAfterChangeBuyAddress: (address: UserAddressListItem) => void | Promise<void>;
	};
	SELLER_COUPON: DomainModalCommon & {
		prevSellerCoupon?: SellerCoupon;
		handleAfterAddCoupon?: (coupon: AddCouponRequest) => void | Promise<void>;
		handleAfterUpdateCoupon?: (coupon: UpdateCouponRequest) => void | Promise<void>;
		handleAfterDeleteCoupon?: (couponId: number) => void | Promise<void>;
	};
	SELLER_PRODUCT_OPTION: DomainModalCommon & {
		prevSellerProductOption?: SellerProductOption;
		productOptionSizeDuplicateList?: string[]; // 판매자 제품 옵션 사이즈 중복 확인 리스트
		handleAfterAddSellerProductOption?: (option: AddProductOptionBase) => void | Promise<void>;
		handleAfterUpdateSellerProductOption?: (option: UpdateSellerProductOptionRequest) => void | Promise<void>;
		handleAfterDeleteSellerProductOption?: (productOptionId: number) => void | Promise<void>;
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
