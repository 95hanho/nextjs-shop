import { Coupon, Review, ReviewImage } from "@/types/mypage";
import { FileInfo } from "./file";
import { BaseResponse } from "@/types/common";

/* MODEL ----------------------------------------------------------------- */

export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";
export type ProductColorName =
	| "BLACK"
	| "WHITE"
	| "GRAY"
	| "NAVY"
	| "BEIGE"
	| "RED"
	| "PINK"
	| "ORANGE"
	| "YELLOW"
	| "GREEN"
	| "KHAKI"
	| "MINT"
	| "BLUE"
	| "SKYBLUE"
	| "PURPLE"
	| "BROWN"
	| "IVORY"
	| "CHARCOAL"
	| "DENIM";

export type Product = {
	productId: number;
	name: string;
	colorName: ProductColorName;
	originPrice: number;
	finalPrice: number;
	createdAt: string;
	likeCount: number;
	viewCount: number;
	wishCount: number;
};
export type ProductDetail = Product & {
	menuSubId: number;
	subMenuName: string;
	topMenuName: string;
	gender: "M" | "F";
	materialInfo: string | null;
	manufacturerName: string | null;
	countryOfOrigin: string | null;
	washCareInfo: string | null;
	manufacturedYm: string | null;
	qualityGuaranteeInfo: string | null;
	afterServiceContact: string | null;
	afterServiceManager: string | null;
	afterServicePhone: string | null;
};
export type ProductOption = {
	productOptionId: number;
	productId: number;
	addPrice: number;
	stock: number;
	size: ProductSize;
};
export type ProductQna = {
	productQnaId: number;
	question: string;
	createdAt: string;
	answer: string;
	resCreatedAt: string;
	answerRead: boolean;
	secret: boolean;
	productQnaTypeId: number;
};
export type ProductQnaTypeCode = "PRODUCT" | "RESTOCK" | "SIZE" | "SHIPPING" | "ETC";
export type ProductQnaType = {
	productQnaTypeId: number;
	code: ProductQnaTypeCode;
	name: string;
};

/* API ----------------------------------------------------------------- */
/* 제품 리스트 조회 */
export interface GetProductListRequest {
	sort: string;
	menuSubId: number;
	lastCreatedAt?: string;
	lastProductId?: number;
	lastPopularity?: number;
}
export type ProductItem = Product & {
	sellerId: "seller07";
	sellerName: "Casual Mood";
	productImageList: FileInfo[];
};

export interface GetProductListResponse extends BaseResponse {
	productList: ProductItem[];
}
/* 장바구니 넣기 */
export type AddCartItem = {
	productOptionId: number;
	quantity: number;
};
export interface AddCartRequest {
	addCartList: AddCartItem[];
	productId: number;
}
/* 제품 상세보기 조회 */
export type ProductImage = FileInfo & {
	productId: number;
};
export type ProductDetailResponse = ProductDetail & {
	productImageList: ProductImage[];
} & {
	sellerName: string;
	sellerNameEn: string; // 영문 이름
	businessRegistrationNumber: string; // 사업자 등록 번호
	telecomSalesNumber: string; // 통신판매업 신고 번호
	representativeName: string; // 대표자 이름
	businessZipcode: string; // 사업장 우편번호
	businessAddress: string; // 사업장 주소
	businessAddressDetail: string; // 사업장 주소 상세
	sellerLikeCount: number; // 판매자 좋아요 수
	baseShippingFee: number; // 기본 배송비
	freeShippingMinAmount: number; // 무료배송 최소 주문금액
	extraShippingFee: number; // 제주/도서산간 추가 배송비
	//
	shippingType: "IMMEDIATE" | "RESERVED"; // 출고 방식('IMMEDIATE','RESERVED')
	shippingDueDate: string; // 출고 예정일
	shippingNote: string; // 출고 관련 추가 안내 문구
};
export interface GetProductDetailResponse extends BaseResponse {
	productDetail: ProductDetailResponse;
	productOptionList: ProductOption[];
	productReviewSummary: {
		avgRating: number;
		reviewCount: number;
	};
}
/* 제품 상세보기 쿠폰 조회 */
export type AvailableCouponAtProductDetail = Coupon & {
	issueMethod: string;
	couponAllowedId: number | null;
	userCouponId: number | null;
	sellerName: string | null;
};
export interface GetProductDetailCouponResponse extends BaseResponse {
	availableProductCoupon: AvailableCouponAtProductDetail[];
}
/* 제품 상세보기 상세이미지(상품소개) 조회 */
export interface GetProductDetailImageResponse extends BaseResponse {
	productDetailImageList: ProductImage[];
}
/* 판매자 좋아요 여부 및 판매자 다른 제품 조회 */
export type OtherProduct = Product & {
	sellerName: string;
	wished: boolean; // 해당 유저 위시 여부
} & FileInfo;
export interface SellerLikeAndOtherProductsResponse extends BaseResponse {
	isSellerLiked: boolean;
	sellerOtherProducts: OtherProduct[];
}
/* 제품 상세보기 리뷰 조회 */
export type ProductReviewItem = Review & {
	orderItemId: number;
	userName: string;
	reviewImages: ReviewImage[];
};
export interface GetProductDetailReviewResponse extends BaseResponse {
	productReviewList: ProductReviewItem[];
}
/* 제품 상세보기 Q&A 조회 */
export type ProductQnaItem = ProductQna & {
	qnaTypeCode: ProductQnaTypeCode;
	qnaTypeName: string;
	userName: string;
};
export interface GetProductDetailQnaResponse extends BaseResponse {
	productQnaList: ProductQnaItem[];
	productQnaTypeList: ProductQnaType[];
}
/* 제품 상품 Q&A 작성 */
export interface AddProductQnaRequest {
	question: string;
	productQnaTypeId: number;
	secret: boolean;
}
/* 제품 상품 Q&A 수정 */
export interface UpdateProductQnaRequest {
	productQnaId: number;
	question: string;
	secret: boolean;
}
/* 같은 카테고리 BEST 제품 조회 */
export interface GetCategoryBestProductsResponse extends BaseResponse {
	categoryBestProductList: OtherProduct[];
}
