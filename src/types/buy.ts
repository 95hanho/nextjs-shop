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
