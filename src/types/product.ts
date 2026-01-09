import { FileInfo } from "./file";

export type Product = {
	productId: number;
	name: string;
	colorName: string;
	price: number;
	createdAt: string;
	likeCount: number;
	viewCount: number;
	wishCount: number;
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
	lastCreatedAt: string;
	lastProductId: number;
	lastPopularity: number;
}
export type ProductItem = Product & {
	sellerId: "seller07";
	sellerName: "Casual Mood";
} & FileInfo;

export interface GetProductListResponse {
	productList: ProductItem[];
}
/*  */
export interface AddCartRequest {
	productOptionId: number;
	quantity: number;
}
