export interface BuyItem {
	productDetailId: number;
	addPrice: number; // 옵션 추가금 (0 이상)
	count: number; // 1 이상 정수
}

export interface BuyHoldRequest {
	userId: string;
	buyList: BuyItem[];
}
