import { Coupon, UserCoupon } from "@/types/mypage";
import { FileInfo } from "./file";

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
	sellerId: string;
	menuSubId: number;
	subName: string;
	topName: string;
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
	createdAt: string;
	size: string;
	salesCount: number;
};

/*  */
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

export interface GetProductListResponse {
	productList: ProductItem[];
}
/*  */
export interface AddCartRequest {
	productOptionId: number;
	quantity: number;
}
/* ---------- */
export interface GetProductDetailResponse {
	productDetail: Product &
		ProductDetail & {
			productImageList: FileInfo[];
		};
	productOptionList: ProductOption[];
	availableProductCoupon: Coupon &
		UserCoupon & {
			sellerId: string;
			sellerName: string;
		};
}
