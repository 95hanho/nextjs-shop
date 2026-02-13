import { BaseResponse } from "./common";
import { FileInfo } from "./file";
import { ProductOption } from "./product";
// 쿠폰
export type Coupon = {
	couponId: number;
	description: string;
	couponCode: string;
	discountType: "percentage" | "fixed_amount";
	discountValue: number;
	maxDiscount: number;
	minimumOrderBeforeAmount: number;
	isStackable: boolean;
	isProductRestricted: boolean;
	amount: number;
	startDate: string;
	endDate: string;
	issueMethod: string;
};
export type AdminCoupon = {
	status: "ACTIVE" | "SUSPENDED" | "DELETED";
	createdAt: string;
	updatedAt: string;
};
// 주문배송정보
export type OrderGroup = {
	orderId: number;
	orderDate: string;
	eachCouponDiscountTotal: number;
	commonCouponDiscountTotal: number;
	shippingFee: number;
	usedMileage: number;
	totalPrice: number;
	paymentMethod: "CARD" | "CASH";
	paymentCode: string | null;
	status: "ORDERED" | "CANCELLED" | "PAID" | "SHIPPED" | "DELIVERED" | "PREPARING";
	shippingDate: string | null;
	deliveredDate: string | null;
	returnDate: string | null;
};
// 상품별 주문배송정보
export type OrderItem = {
	orderListId: number;
	count: number;
	orderPrice: number;
	discountPrice: number;
	paidUnitPrice: number;
};
// 리뷰
export type Review = {
	reviewId: 3;
	content: string;
	reviewDate: string;
	rating: number;
};
// 유저 쿠폰
export type UserCoupon = {
	userCouponId: 3;
	used: boolean;
};
// 유저 주소
export type UserAddress = {
	addressId?: number;
	addressName: string;
	recipientName: string;
	addressPhone: string;
	zonecode: string;
	address: string;
	addressDetail: string;
	memo: string;
};
// 카트
export type Cart = {
	cartId: number;
	createdAt: string;
	quantity: number;
	selected: boolean;
};
/* ---- API --------------------------------------------- */
/* 유저 쿠폰 조회 */
export interface UserCouponResponse extends BaseResponse {
	couponList: (Coupon &
		UserCoupon & {
			sellerId: string;
			sellerName: string;
		})[];
}

/* 주문배송정보 조회 */
export type MyOrderItem = OrderItem & {
	orderId: number;
	holdId: number;
	productOptionId: number;
	addPrice: number;
	size: string;
	productId: number;
	productName: string;
	colorName: string;
	originPrice: number;
	finalPrice: number;
	sellerName: string;
	//
	productImageId: number;
} & Review & {
		menuSubId: number;
		subMenuName: string;
		menuTopId: number;
		topMenuName: string;
		gender: string;
	} & FileInfo;

// 주문배송정보
export type MyOrder = OrderGroup & {
	items: MyOrderItem[];
};
// 주문배송정보 조회
export interface MyOrderListResponse extends BaseResponse {
	myOrderList: MyOrder[];
}
/* 주문배송정보 상세조회 */
// 주문배송정보 상세상품 정보
export type MyOrderDetailItem = OrderItem & {
	orderId: number;
	userCouponId: number;
	couponId: number;
	description: string;
	couponCode: string;
	discountType: string;
	discountValue: number;
	maxDiscount: null;
	minimumOrderBeforeAmount: number;
	holdId: number;
	productOptionId: number;
	addPrice: number;
	size: string;
	productId: number;
	productName: string;
	colorName: string;
	originPrice: number;
	finalPrice: number;
	sellerName: string;
} & Review & {
		menuSubId: number;
		subMenuName: string;
		menuTopId: number;
		topMenuName: string;
		productImageId: number;
	} & FileInfo & {
		stackable: false;
	};
// 주문배송정보 상세
export type MyOrderDetail = OrderGroup &
	UserAddress & {
		userId: string;
		//
		remainingMileage: number;
		//
		userCouponId: number;
		couponId: number;
		description: string;
		couponCode: string;
		discountType: string;
		discountValue: number;
		maxDiscount: null;
		minimumOrderBeforeAmount: number;
	} & {
		item: MyOrderDetailItem[];
	} & {
		defaultAddress: boolean;
		stackable: boolean;
	};
export interface MyOrderDetailResponse extends BaseResponse {
	myOrderDetail: MyOrderDetail;
}
/* 리뷰 작성 */
export interface writeReviewRequest {
	content: string;
	rating: number;
	orderListId: number;
}
/* 장바구니 조회 */
export type CartItem = Cart & {
	productOptionId: number;
	addPrice: number;
	stock: number;
	size: string;
	productId: number;
	productName: string;
	originPrice: number;
	finalPrice: number;
	wishId: number;
} & FileInfo & {
		sellerName: string;
	};
export interface GetCartResponse extends BaseResponse {
	cartList: CartItem[];
}
/* 장바구니 제품 옵션/수량 변경 */
export interface UpdateCartRequest {
	cartId: number;
	productOptionId: number;
	quantity: number;
}
/* 장바구니 제품 선택여부 변경 */
export interface UpdateCartSelectedRequest {
	cartIdList: number[];
	selected: boolean;
}
/* 장바구니 제품 다른 option조회 */
export interface GetCartOtherOptionListResponse extends BaseResponse {
	cartOptionProductOptionList: ProductOption[];
}
/* 위시리스트 조회 */
export type wishlistItem = {
	wishId: number;
	createdAt: string;
	productId: number;
	name: string;
	originPrice: number;
	finalPrice: number;
	likeCount: number;
	viewCount: number;
	wishCount: number;
	productImageId: number;
} & FileInfo & {
		sellerName: string;
	};
export interface GetWishListResponse extends BaseResponse {
	wishlistItems: wishlistItem[];
}
/* 유저배송지 조회 */
export type UserAddressListItem = UserAddress & {
	usedateAt: null;
	defaultAddress: boolean;
};
export interface GetUserAddressListResponse extends BaseResponse {
	userAddressList: UserAddressListItem[];
}
/* 유저배송지 추가/수정 */
export interface setUserAddressRequest {
	addressId?: number;
	addressName: string;
	recipientName: string;
	addressPhone: string;
	zonecode: string;
	address: string;
	addressDetail: string;
	memo: string;
	defaultAddress?: boolean;
	default?: boolean;
}
