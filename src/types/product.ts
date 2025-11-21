import { FileInfo } from "./file";

export type Product = {
	productId: number;
	name: string;
	colorName: string;
	price: number;
	createdAt: string;
	viewCount: number;
	wishCount: number;
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
	productDetailId: number;
	quantity: number;
	userId: string;
}
