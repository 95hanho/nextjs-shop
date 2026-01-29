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
	status: "ACTIVE" | "SUSPENDED" | "DELETED";
	isStackable: boolean;
	isProductRestricted: boolean;
	amount: number;
	startDate: string;
	endDate: string;
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
/*  */
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
	price: number;
	sellerId: string;
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
		default: boolean;
		stackable: boolean;
	};
// 주문배송정보 상세조회
export interface MyOrderDetailResponse extends BaseResponse {
	myOrderDetail: MyOrderDetail;
}
/*  */
export interface writeReviewRequest {
	content: string;
	rating: number;
	orderListId: number;
}
/*  */
export type CartItem = Cart & {
	productOptionId: number;
	addPrice: number;
	stock: number;
	size: string;
	productId: number;
	productName: string;
	price: number;
	wishId: number;
	fileId: number;
	fileName: string | null;
	storeName: string | null;
	filePath: string | null;
	copyright: string | null;
	copyrightUrl: string | null;
	sellerId: string;
	sellerName: string;
};
export interface GetCartResponse extends BaseResponse {
	cartList: CartItem[];
}
/*  */
export interface UpdateCartRequest {
	cartId: number;
	productOptionId: number;
	quantity: number;
}
/*  */
export interface UpdateCartSelectedRequest {
	cartIdList: number[];
	selected: boolean;
}
/*  */
export interface GetCartOptionProductOptionListResponse extends BaseResponse {
	cartOptionProductOptionList: ProductOption[];
}
/*  */
export type wishlistItem = {
	wishId: number;
	createdAt: string;
	userId: string;
	productId: number;
	name: string;
	originPrice: number;
	finalPrice: number;
	likeCount: number;
	viewCount: number;
	wishCount: number;
	productImageId: number;
} & FileInfo & {
		sellerId: string;
		sellerName: string;
	};
export interface GetWishListResponse extends BaseResponse {
	wishlistItems: wishlistItem[];
}
/*  */
export type UserAddressListItem = UserAddress & {
	createdAt: "2025-10-20T05:56:25.000+00:00";
	usedateAt: null;
	userId: null;
	deleted: false;
	defaultAddress: boolean;
};
export interface GetUserAddressListResponse extends BaseResponse {
	userAddressList: UserAddressListItem[];
}
/*  */
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
/*  */
export type InputAddress = {
	addressName: string;
	recipientName: string;
	addressPhone: string;
	address: string;
	addressDetail: string;
	memo: string;
};
