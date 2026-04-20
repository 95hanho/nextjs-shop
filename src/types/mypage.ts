import { BaseResponse } from "./common";
import { FileInfo } from "./file";
import { ProductOption, ProductSize } from "./product";
// 쿠폰
export type Coupon = {
	couponId: number;
	description: string;
	discountType: "percentage" | "fixed_amount";
	discountValue: number;
	maxDiscount: number | null;
	minimumOrderBeforeAmount: number;
	isStackable: boolean;
	isProductRestricted: boolean;
	amount: number;
	usedCount: number;
	startDate: string;
	endDate: string;
	issueMethod: "CLAIM" | "AUTO" | "MANUAL";
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
	sellerCouponDiscountTotal: number;
	cartCouponDiscountTotal: number;
	shippingFee: number;
	usedMileage: number;
	remainingMileage: number;
	earnedMileage: number;
	totalPrice: number;
	paymentMethod: "CARD" | "CASH";
	paymentCode: string | null;
};
export type OrderItemStatus = "ORDERED" | "CANCELLED" | "SHIPPED" | "DELIVERED" | "PREPARING";
// 상품별 주문배송정보
export type OrderItem = {
	orderItemId: number;
	orderId: number;
	holdId: number;
	productName: string;
	count: number;
	size: ProductSize;
	originPrice: number;
	finalPrice: number;
	addPrice: number;
	couponDiscountedPrice: number;
	totalPrice: number;
	status: OrderItemStatus;
	shippingDate: string | null;
	deliveredDate: string | null;
	returnDate: string | null;
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
export type MyOrderItem = {
	orderItemId: number;
	orderId: number;
	holdId: number;
	productId: number;
	productName: string;
	count: number;
	size: ProductSize;
	originPrice: number;
	finalPrice: number;
	addPrice: number;
	status: OrderItemStatus;
	//
	reviewId: number | null;
	//
	sellerNo: number;
	sellerName: string;
	sellerNameEn: string | null;
} & FileInfo;

// 주문배송정보
export type MyOrder = { orderId: number; orderDate: string } & {
	items: MyOrderItem[];
};
// 주문배송정보 조회
export interface MyOrderListResponse extends BaseResponse {
	myOrderList: MyOrder[];
}
/* 주문배송정보 상세조회 */
// 주문배송정보 상세상품 정보
export type MyOrderDetailItem = OrderItem & {
	productId: number;
	reviewId: number | null;
	productOptionId: number;
	sellerNo: number;
	sellerName: string;
	sellerNameEn: string | null;
	productImageId: number;
} & FileInfo & {
		coupons: {
			orderItemCouponId: number;
			orderItemId: number;
			userCouponId: number;
			discountedPrice: number;
			couponId: number;
			description: string;
			couponCode: string | null;
			discountType: "percentage" | "fixed_amount";
			discountValue: number;
			maxDiscount: number;
			minimumOrderBeforeAmount: number;
			sellerNo: number | null;
		}[];
	};
/* 주문배송정보 상세 */
export type MyOrderDetail = OrderGroup &
	Omit<UserAddress, "addressId"> & {
		addressId: number;
	};
export interface MyOrderDetailResponse extends BaseResponse {
	myOrderDetail: MyOrderDetail;
	myOrderDetailItems: MyOrderDetailItem[];
}
/* 리뷰 주문정보 조회 */
export type ReviewOrderItem = {
	orderItemId: number;
	orderId: number;
	productName: string;
	count: number;
	size: ProductSize;
	originPrice: number;
	finalPrice: number;
	addPrice: number;
	couponDiscountedPrice: number;
	totalPrice: number;
	status: OrderItemStatus;
	//
	holdId: number;
	productOptionId: number;
	productId: number;
	sellerNo: number;
	sellerName: string;
	sellerNameEn: string | null;
	productImageId: number;
} & FileInfo;
export type ReviewImage = {
	reviewImageId: number;
	reviewId: number;
	sortKey: number;
} & FileInfo;
export type ReviewInfo = {
	reviewId: number;
	content: string;
	rating: number;
	reviewImages: ReviewImage[];
};
export interface ReviewOrderInfoResponse extends BaseResponse {
	reviewOrderItem: ReviewOrderItem;
	review: ReviewInfo | null;
}
/* 리뷰 작성 */
export interface WriteReviewRequest {
	content: string;
	rating: number;
	orderItemId: number;
}
/* 리뷰 수정 */
export interface UpdateReviewRequest {
	reviewId: number;
	content: string;
	rating: number;
}
/* 리뷰 이미지 설정 */
export type UpdateFile = {
	reviewImageId: number;
	sortKey: number;
};
export type AddFilesMeta = {
	clientKey: string;
	sortKey: number;
	fileName: string;
};
export interface SetReviewImageRequest {
	reviewId: number;
	files: File[];
	addFiles: AddFilesMeta[];
	updateFiles: UpdateFile[];
	deleteImageIds: number[];
}
/* 장바구니 조회 */
export type CartItem = Cart & {
	productOptionId: number;
	addPrice: number;
	stock: number;
	size: ProductSize;
	productId: number;
	productName: string;
	originPrice: number;
	finalPrice: number;
	wishId: number;
} & FileInfo & {
		sellerName: string;
		baseShippingFee: number; // 기본 배송비
		freeShippingMinAmount: number; // 무료배송 최소 주문금액
	};

export type AvailableCartCouponAtCart = Coupon & {
	couponAllowedId: number | null;
	productId: number | null;
	userCouponId: number | null;
};
export type AvailableSellerCouponAtCart = Coupon & {
	couponAllowedId: number | null;
	productId: number | null;
	userCouponId: number | null;
	sellerName: string;
};
export interface GetCartResponse extends BaseResponse {
	isExceedQuantity: boolean; // 장바구니 내 상품 중 재고 수량보다 주문 수량이 초과된 상품이 있는지 여부
	cartList: CartItem[];
	availableCartCoupons: AvailableCartCouponAtCart[];
	availableSellerCoupons: AvailableSellerCouponAtCart[];
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
	productImageList: FileInfo[];
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
