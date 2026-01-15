import { JwtPayload } from "jsonwebtoken";
import { BaseResponse } from "./common";
import { Coupon } from "./mypage";
import { Product, ProductDetail, ProductOption } from "./product";

// 로그인폼 데이터
export type SellerLoginForm = {
	sellerId: string;
	password: string;
};

// 로그인 토큰 구조
export type SellerToken = {
	type: "SELLER";
	sellerId: string;
} & JwtPayload;

export type SellerInfo = {
	sellerId: string;
	sellerName: string;
	sellerNameEn: string;
	extensionNumber: string;
	mobileNumber: string;
	email: string;
	businessRegistrationNumber: string;
	telecomSalesNumber: string;
	representativeName: string;
	businessZipcode: string;
	businessAddress: string;
	businessAddressDetail: string;
};
export type SellerApprove = {
	requestedAt: string;
	approvedAt: string;
};

/* ------------------------------------------------------------- */

/* ---------- 판매자 등록요청 ---------*/
export interface SellerRegisterRequest extends SellerLoginForm, SellerInfo {}

/* ---------- 회원정보 조회 ---------*/
export interface SellerResponse extends BaseResponse {
	seller: SellerInfo;
}
/* ---------- 판매자 제품 조회 ---------*/
export type sellerProduct = ProductDetail & {
	sellerId: string;
	subMenuName: string;
	topMenuName: string;
	gender: string;
	optionList: ProductOption[];
};
export interface GetSellerProductListResponse extends BaseResponse {
	sellerProductList: sellerProduct[];
}
/* ---------- 판매자 제품 추가 ---------*/
export interface AddSellerProductRequest {
	name: string;
	colorName: string;
	price: number;
	menuSubId: number;
	materialInfo: string;
	manufacturerName: string;
	countryOfOrigin: string;
	washCareInfo: string;
	manufacturedYm: string;
	qualityGuaranteeInfo: string;
	afterServiceContact: string;
	afterServiceManager: string;
	afterServicePhone: string;
}
/* ---------- 판매자 제품 수정 ---------*/
export interface UpdateSellerProductRequest extends AddSellerProductRequest {
	productId: number;
}
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
