import { BaseResponse } from "./common";

export interface BuyItem {
	productOptionId: number;
	addPrice: number; // 옵션 추가금 (0 이상)
	count: number; // 1 이상 정수
}

export interface BuyHoldRequest {
	userId: string;
	buyList: BuyItem[];
}
export interface BuyHoldResponse extends BaseResponse {
	holds: {
		productOptionId: number;
		holdId: number;
	}[];
}
export interface ExtendStockHoldRequest {
	holdIds: number[];
}
export interface ExtendStockHoldResponse extends BaseResponse, ExtendStockHoldRequest {
	requestedCount: number;
	updatedCount: number;
}
