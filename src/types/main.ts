import { BaseResponse } from "./common";

/* ---- API --------------------------------------------- */

/* 메뉴 가져오기 */
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
export interface MenuResponse extends BaseResponse {
	menuList: Menu[];
}
/* 메인 슬라이드 제품 가져오기 */
export type MainProduct = {
	productId: number;
	name: string;
	// brand: string;
	price: string;
	imgPath: string;
	copyright: string;
	copyrightUrl: string;
	createdAt: Date;
	likeCount: number;
	viewCount: number;
	wishCount: number;
	// salesCount: number;
};
export interface MainProductResponse extends BaseResponse {
	productList: MainProduct[];
}
