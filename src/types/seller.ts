import { BaseResponse } from "./common";
import { Coupon } from "./mypage";
import { Product } from "./product";

// 로그인폼 데이터
export type SellerLoginForm = {
	sellerId: string;
	password: string;
};

export type sellerProductOption = {};
export type sellerProduct = Product & {
	sellerId: string;
	subMenuName: string;
	topMenuName: string;
	gender: string;
	optionList: sellerProductOption;
};
export interface GetSellerProductListResponse extends BaseResponse {
	sellerProductList: sellerProduct[];
}
/*  */
export interface AddSellerProductRequest {
	name: string;
	colorName: string;
	price: number;
	sellerId: string;
	menuSubId: number;
}
export interface UpdateSellerProductRequest {
	productId: number;
	name: string;
	colorName: string;
	price: number;
	saleStop: boolean;
	menuSubId: number;
}
/*  */
export interface AddSellerProductOption {
	productId: number;
	addPrice: number;
	stock: number;
	size: string;
}
export interface UpdateSellerProductOption {
	productOptionId: number;
	addPrice: number;
	stock: number;
}
/*  */
export type CouponListItem = Coupon & {
	sellerId: null;
};
export interface GetSellerCouponListResponse extends BaseResponse {
	couponList: CouponListItem[];
}
/*  */
export interface AddCoupnRequest {
	description: string;
	couponCode: string;
	discountType: "percentage" | "fixed_amount";
	discountValue: number;
	maxDiscount: number;
	minimumOrderBeforeAmount: number;
	status: "Y" | "N";
	isStackable: boolean;
	isProductRestricted: boolean;
	amount: number;
	startDate: string;
	endDate: string;
	sellerId: string;
}
/*  */
export type CouponAllowedProductListItem = {
	couponAllowedId: number;
	couponId: number;
	productId: number;
	name: string;
	createdAt: string;
};
export interface GetSellerCouponAllowResponse extends BaseResponse {
	CouponAllowedProductList: CouponAllowedProductListItem[];
}
/*  */
export interface SetSellerCouponAllowRequest {
	couponId: number;
	productIds: number[];
}
/*  */
export interface IssueCouponsToUsersRequest {
	couponId: number;
	userIds: string[];
}
/*  */
export type ProductWishCount = {
	latestDate: string;
	userId: string;
	userName: string;
	productNames: string;
};
export type BrandBookmark = {
	createdAt: string;
	userId: string;
	userName: string;
};
export type ProductViewCount = {
	userId: string;
	userName: string;
	productId: number;
	productName: string;
	likeCount: number;
	viewCount: number;
	latestDate: string;
};
export type UserInCartCount = {
	latestDate: string;
	inCartCount: number;
	userId: string;
	userName: string;
	productNames: string;
};
export interface GetSellerInterestingUserResponse extends BaseResponse {
	productWishCountList: ProductWishCount[];
	brandBookmarkList: BrandBookmark[];
	productViewCountList: ProductViewCount[];
	userInCartCountList: UserInCartCount[];
}
