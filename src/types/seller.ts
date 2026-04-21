import { FileInfo } from "@/types/file";
import { BaseResponse } from "./common";
import { AdminCoupon, Coupon } from "./mypage";
import { ProductColorName, ProductDetail, ProductOption, ProductQnaType, ProductQnaTypeCode, ProductSize } from "./product";

/* -- MODEL ----------------------------------------------------------------- */

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
export type SellerProductOption = ProductOption & SellerProductOptionAdd;
export type SellerProduct = ProductDetail & {
	updatedAt: string;
	subMenuName: string;
	topMenuName: string;
	avgRating: number; // 평균별점
	reviewCount: number; // 리뷰갯수
	optionList: SellerProductOption[];
	saleStop: boolean;
};
export interface GetSellerProductListResponse extends BaseResponse {
	sellerProductList: SellerProduct[];
}
/* 제품 추가 */
export interface AddSellerProductRequest {
	name: string;
	colorName: ProductColorName;
	originPrice: number;
	finalPrice: number;
	menuSubId: number;
	materialInfo?: string;
	manufacturerName?: string;
	countryOfOrigin?: string;
	washCareInfo?: string;
	manufacturedYm?: string;
	qualityGuaranteeInfo?: string;
	afterServiceContact?: string;
	afterServiceManager?: string;
	afterServicePhone?: string;
}
/* 제품 수정 */
export interface UpdateSellerProductRequest extends AddSellerProductRequest {
	productId: number;
	saleStop: boolean;
	imageUpdate: boolean; // 이미지수정날짜 최신화 여부
}
// "productImageId": 1,
// "productId": 0,
// "sortKey": 100.000000,
// "thumbnail": true

/* 제품 상세보기 조회 */
export type ProductImageItem = FileInfo & {
	productImageId: number;
	productId: number;
	sortKey: number;
	thumbnail: boolean;
};
export type SellerProductDetail = ProductDetail & {
	menuTopId: number;
	updatedAt: string;
	productImageUpdatedAt: string;
	subMenuName: string;
	topMenuName: string;
	saleStop: boolean;
	productImages: ProductImageItem[];
};
export interface GetSellerProductDetailResponse extends BaseResponse {
	productDetail: SellerProductDetail;
}
/* 제품 이미지 설정 */
export type AddFile = {
	file: File;
	sortKey: number;
	isThumbnail: boolean;
};
export type UpdateFile = {
	productImageId: number;
	sortKey: number;
};
export type AddFilesMeta = {
	clientKey: string;
	sortKey: number;
	isThumbnail: boolean;
	fileName: string;
};
export interface SetSellerProductImageRequest {
	files: File[];
	productId: number;
	addFiles: AddFilesMeta[];
	updateFiles: UpdateFile[];
	deleteImageIds: number[];
}
/* 제품 옵션 추가 */
export type AddProductOptionBase = {
	addPrice: number;
	stock: number;
	size: ProductSize;
};
export interface AddSellerProductOptionRequest extends AddProductOptionBase {
	productId: number;
}
/* 제품 옵션 수정 */
export interface UpdateSellerProductOptionRequest {
	productOptionId: number;
	addPrice: number;
	stock: number;
	size: ProductSize;
	isDisplayed: boolean;
}
/* 제품 옵션 삭제 */
export interface DeleteSellerProductOptionRequest {
	productOptionId: number;
}
/* 쿠폰 조회 */
export type SellerCoupon = Coupon & AdminCoupon;

export interface GetSellerCouponListResponse extends BaseResponse {
	couponList: SellerCoupon[];
}
/* 쿠폰 등록 */
export interface AddCouponRequest {
	description: string;
	discountType: "percentage" | "fixed_amount";
	discountValue: number;
	maxDiscount?: number;
	minimumOrderBeforeAmount?: number;
	isStackable: boolean;
	isProductRestricted: boolean;
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
	maxDiscount?: number;
	minimumOrderBeforeAmount: number;
	status: "ACTIVE" | "SUSPENDED" | "DELETED";
	isStackable: boolean;
	isProductRestricted: boolean;
	amount: number;
	startDate: string;
	endDate: string;
}
/* 쿠폰 상태 변경 */
export interface UpdateCouponStatusRequest {
	activeCouponIds?: number[];
	suspendedCouponIds?: number[];
}
/* 쿠폰 허용제품 조회 */
export interface GetSellerCouponAllowResponse extends BaseResponse {
	couponAllowedProductIds: number[];
}
/* 쿠폰 허용제품 변경 */
export interface SetSellerCouponAllowRequest {
	couponId: number;
	addProductIds: number[];
	removeProductIds: number[];
}
/* 쿠폰을 유저에게 발행하기  */
export type IssueCouponType = "VIEW" | "WISH" | "BOOKMARK" | "CART" | "ORDER";
export interface IssueCouponToUsersRequest {
	couponId: number;
	type: IssueCouponType;
}
/* 판매자 리뷰 조회 */
export type SellerReview = {
	reviewId: number;
	content: string;
	rating: number;
	createdAt: string;
	userName: string;
	productId: number;
	productName: string;
	/*  */
	reviewImageId: number;
} & FileInfo;
export interface GetSellerReviewResponse extends BaseResponse {
	sellerReviewList: SellerReview[];
}
/* 판매자 QnA 조회 */
export type SellerQna = {
	productQnaId: number;
	question: string;
	createdAt: string;
	answer: string;
	secret: boolean;
	answerRead: boolean; // 답변 읽음 여부
	productQnaTypeId: number;
	productQnaTypeCode: ProductQnaTypeCode;
	productQnaTypeName: string;
	productId: number;
	productName: string;
	userName: string;
};
export interface GetSellerQnaResponse extends BaseResponse {
	sellerQnaList: SellerQna[];
	qnaTypeList: ProductQnaType[];
}
/*  */
export interface UpdateQnaAnswerRequest {
	productQnaId: number;
	answer: string;
}
/* 판매자와 관련된 회원 조회 */
export interface GetSellerInterestingUserResponse extends BaseResponse {
	summary: {
		viewedUserCount: number; // 내 상품 본 회원 수
		wishedUserCount: number; // 위시한 회원 수
		bookmarkedUserCount: number; // 브랜드 즐겨찾기한 회원 수
		cartUserCount: number; // 장바구니 담은 회원 수
		orderedUserCount: number; // 구매한 회원 수 (나중용)
	};
}
