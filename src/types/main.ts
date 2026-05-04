import { FileInfo } from "@/types/file";
import { BaseResponse } from "./common";

/* ---- API --------------------------------------------- */

/* 메뉴 가져오기 */
// 서브메뉴
export type SubMenu = {
	menuSubId: number;
	menuName: string;
	productCount: number;
};
// 상단메뉴
export type Menu = {
	menuTopId: number;
	menuName: string;
	gender: "M" | "F";
	menuSubList: SubMenu[];
};
export interface MenuResponse extends BaseResponse {
	menuList: Menu[];
}
/* 메인 슬라이드 제품 가져오기 */
export type MainProduct = {
	productId: number;
	productName: string;
	originPrice: number;
	finalPrice: number;
	viewCount: number;
	wishCount: number;
	//
	sellerName: string;
} & FileInfo;
export interface MainProductResponse extends BaseResponse {
	productList: MainProduct[];
}
