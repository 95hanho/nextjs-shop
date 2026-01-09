import { BaseResponse } from "./common";

export interface BuyItem {
	productOptionId: number;
	addPrice: number; // 옵션 추가금 (0 이상)
	count: number; // 1 이상 정수
}

/* ---------------------------------------------------- */
/* 상품 확인 및 점유(구매페이지이동) */
export interface BuyHoldRequest {
	buyList: BuyItem[];
}
export interface BuyHoldResponse extends BaseResponse {
	holds: {
		productOptionId: number;
		holdId: number;
	}[];
}
/* 구매상품 점유 연장 */
export interface ExtendStockHoldRequest {
	holdIds: number[];
}
export interface ExtendStockHoldResponse extends BaseResponse, ExtendStockHoldRequest {
	requestedCount: number;
	updatedCount: number;
}

/* 구매상품 점유 해제 */
export interface BuyHoldReleaseResponse extends BaseResponse {
	holdIds: number[];
	releasedCount: number;
	requestedCount: number;
}
/* 점유 중인 상품 및 사용 가능 쿠폰 조회 */
export interface getStockHoldProductResponse extends BaseResponse {
	orderStock: {
		holdId: number;
		count: number;

		productOptionId: number;
		addPrice: number;
		size: string;

		productId: number;
		name: string;
		colorName: string;

		sellerId: string;
		sellerName: string;

		fileName: string;
		storeName: string;
		filePath: string;
		copyright: string;
		copyrightUrl: string;
	};
	availableCouponList: {
		couponId: number;
		description: string;
		couponCode: string;
		discountType: string;
		discountValue: number;
		maxDiscount: number;
		minimumOrderBeforeAmount: number;
		status: string;
		isStackable: boolean;
		isProductRestricted: boolean;
		amount: number;
		startDate: string;
		endDate: string;
		createdAt: string;
		updatedAt: string;
		sellerId: string;
		//
		userCouponId: number;
		used: boolean;
		userId: string;
	};
}
/* 상품 쿠폰, 마일리지, 배송비 여부의 변경에 따라 가격계산해서 보여줌.(결제화면) */
type AvailableCoupon = {
	couponId: number;
	description: string;
	couponCode: string;
	discountType: string;
	discountValue: number;
	maxDiscount: number;
	minimumOrderBeforeAmount: number;
	status: string;
	isStackable: boolean;
	isProductRestricted: boolean;
	amount: number;
	startDate: string;
	endDate: string;
	createdAt: string;
	updatedAt: string;
	sellerId: string;
	//
	userCouponId: number;
	used: boolean;
	userId: string;
};
type BuyProduct = {
	holdId: number;
	productOptionId: number;
	count: number;
	couponId: number;
};
export interface payPriceRequest {
	products: BuyProduct[];
	commonCoupon: AvailableCoupon;
	useMileage: number;
}
type ProductWithCoupons = {
	holdId: number;
	count: number;

	productOptionId: number;
	addPrice: number;

	userCouponId: number;

	productId: number;
	price: number;

	couponId: number;
	description: string;
	discountType: string; // 할인유형 'percentage', 'fixed_amount'
	discountValue: number; // 할인 비율/값
	maxDiscount: number; // 최대 할인값
	minimumOrderBeforeAmount: number; // 할인 전 쿠폰 사용을 위한 최소 주문금액
	isStackable: boolean;
	isProductRestricted: boolean;

	discountAmount: number; // 적용된 총 할인 금액
	finalPrice: number; // 최종 결제 금액 (쿠폰 적용)
};
export interface payPriceResponse extends BaseResponse {
	items: ProductWithCoupons[];
	onlyEachCouponDiscountTotal: number; // 각각 상품 쿠폰으로만 할인된 가격
	onlyEachCouponFinalTotal: number; // 각각 상품 쿠폰으로만 할인받은 최종가격
	mainCouponDiscount: number; // 공용쿠폰 할인
	afterMainCouponTotal: number; // 공용쿠폰 적용 후 합계
	mileageRequested: number; // 요청된 마일리지
	mileageApplied: number; // 적용된 마일리지
	deliveryFee: number; // 배송비
	totalDiscount: number; // 총 할인비(쿠폰할인 + 마일리지)
	totalFinal: number; // 총 금액
}
/* 상품 구매/결제 */
export interface payRequest {
	items: ProductWithCoupons[];
	eachCouponDiscountTotal: number; // 각 상품쿠폰 할인값 총합
	commonCouponDiscountTotal: number; // 공용쿠폰 할인값 총합
	shippingFee: number; // 배송비
	usedMileage: number; // 사용된 마일리지
	remainingMileague: number; // 남은마일리지
	totalFinal: number; // 총가격(배송비 포함)
	paymentMethod: string; // 결제 방식

	userCouponId: number;
	addressId: number;
}
