import { BaseResponse } from "./common";
import { AdminCoupon, Coupon } from "./mypage";
import { ProductDetail, ProductOption } from "./product";

/* -- FE -------------------------------------------------------- */

// 로그인폼 데이터
export type SellerLoginForm = {
	sellerId: string;
	password: string;
};

export type SellerInfo = {
	sellerName: string; // 판매자 이름(한글)
	sellerNameEn: string; // 판매자 이름(영어)
	extensionNumber: string; // 내선전화
	mobileNumber: string; // 대표 번호
	email: string; // 이메일
	businessRegistrationNumber: string; // 사업자 등록번호
	telecomSalesNumber: string; // 통신 판매자 번호
	representativeName: string; // 대표자 이름
	businessZipcode: string; // 사업장 소재지 우편번호
	businessAddress: string; // 사업장 소재지 주소
	businessAddressDetail: string; // 사업장 소재지 상세주소
};
export type SellerApprove = {
	requestedAt: string;
	approvedAt: string;
};

/* -- API -------------------------------------------------------- */

/* 판매자 로그인 */
export interface SellerLoginResponse extends BaseResponse {
	sellerNo: number;
}
/* 회원정보 조회 */
export interface GetSellerInfoResponse extends BaseResponse {
	seller: SellerInfo;
}
/* 판매자 등록요청 */
export interface SellerRegisterRequest extends SellerLoginForm, SellerInfo {}

/* 판매자 제품 조회 */
type SellerProductOptionAdd = { salesCount: number; createdAt: string; updatedAt: string; displayed: boolean };
export type sellerProduct = ProductDetail & {
	sellerId: string;
	subMenuName: string;
	topMenuName: string;
	gender: string;
	optionList: (ProductOption & SellerProductOptionAdd)[];
};
export interface GetSellerProductListResponse extends BaseResponse {
	sellerProductList: sellerProduct[];
}
/* 제품 추가 */
export interface AddSellerProductRequest {
	name: string;
	colorName: string;
	originPrice: number;
	finalPrice: number;
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
/* 제품 수정 */
export interface UpdateSellerProductRequest extends AddSellerProductRequest {
	productId: number;
}

/* 제품 상세보기(개발) */
/* 제품 상세 사진수정(개발) */

/* 제품 옵션 추가 */
export interface AddSellerProductOption {
	productId: number;
	addPrice: number;
	stock: number;
	size: string;
}
/* 제품 옵션 수정 */
export interface UpdateSellerProductOption {
	productOptionId: number;
	addPrice: number;
	stock: number;
	isDisplayed: boolean;
}
/* 쿠폰 조회 */
export interface GetSellerCouponListResponse extends BaseResponse {
	couponList: (Coupon & AdminCoupon)[];
}
/* 쿠폰 등록 */
export interface AddCouponRequest {
	description: string;
	discountType: "percentage" | "fixed_amount";
	discountValue: number;
	maxDiscount: number;
	minimumOrderBeforeAmount?: number;
	amount: number;
	startDate: string;
	endDate: string;
}
/* 쿠폰 수정 */
export interface UpdateCouponRequest {
	couponId: number;
	description: string;
	discountType: "percentage" | "fixed_amount";
	discountValue: number;
	maxDiscount: number;
	minimumOrderBeforeAmount?: number;
	status: "ACTIVE" | "SUSPENDED" | "DELETED";
	isStackable: boolean;
	isProductRestricted: boolean;
	amount: number;
	startDate: string;
	endDate: string;
}
/* 쿠폰 허용제품 조회 */
export type CouponAllowedProductListItem = {
	couponAllowedId: number;
	couponId: number;
	productId: number;
	name: string;
};
export interface GetSellerCouponAllowResponse extends BaseResponse {
	CouponAllowedProductList: CouponAllowedProductListItem[];
}
/* 쿠폰 허용제품 변경 */
export interface SetSellerCouponAllowRequest {
	couponId: number;
	productIds: number[];
	allow: boolean;
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
