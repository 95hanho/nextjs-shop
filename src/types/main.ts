import { BaseResponse } from "./common";

export type MainProduct = {
	productId: number;
	name: string;
	// brand: string;
	price: string;
	imgPath: string;
	copyright: string;
	copyrightUrl: string;
	createdAt: Date;
	viewCount: number;
	wishCount: number;
	// salesCount: number;
};

export interface MainProductResponse extends BaseResponse {
	productList: MainProduct[];
}
// 서브메뉴
export type SubMenu = {
	menuSubId: number;
	menuName: string;
};
// 상단메뉴
export type Menu = {
	menuTopId: number;
	menuName: string;
	gender: string;
	menuSubList: SubMenu[];
};
export interface MenuResponse {
	menuList: Menu[];
}
