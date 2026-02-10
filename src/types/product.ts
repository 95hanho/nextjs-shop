import { Coupon, Review, UserCoupon } from "@/types/mypage";
import { FileInfo } from "./file";
import { BaseResponse } from "@/types/common";

/* MODEL ----------------------------------------------------------------- */

export type Product = {
	productId: number;
	name: string;
	colorName: string;
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
	materialInfo: string;
	manufacturerName: string;
	countryOfOrigin: string;
	washCareInfo: string;
	manufacturedYm: string;
	qualityGuaranteeInfo: string;
	afterServiceContact: string;
	afterServiceManager: string;
	afterServicePhone: string;
};
export type ProductOption = {
	productOptionId: number;
	productId: number;
	addPrice: number;
	stock: number;
	size: string;
};
export type ProductQna = {
	productQnaId: number;
	question: string;
	createdAt: string;
	answer: string;
	resCreatedAt: string;
	secret: false;
	productQnaTypeId: 4;
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
export interface AddCartRequest {
	productOptionId: number;
	quantity: number;
}
/* 제품 상세보기 조회 */
export interface GetProductDetailResponse extends BaseResponse {
	productDetail: Product &
		ProductDetail & {
			productImageList: (FileInfo & { productId: number })[];
		};
	productOptionList: ProductOption[];
	productReviewSummary: {
		avgRating: number;
		reviewCount: number;
	};
	availableProductCoupon: Coupon &
		UserCoupon & {
			couponId: number;
			sellerName: string;
		};
}
/* 제품 리뷰 조회 */
export interface ProductReviewResponse extends BaseResponse {
	productReviewList: (Review & { userName: string })[];
}
/* 제품 상품 Q&A 조회 */
type ProductQnaItem = ProductQna & {
	productQnaTypeName: string;
	userName: string;
};
export interface ProductQnaResponse extends BaseResponse {
	ProductQnaList: ProductQnaItem[];
}
