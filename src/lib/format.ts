import { MILEAGE_RATE } from "@/lib/env";

// 돈 3번쨰 자리마다 쉼표(,)
export const money = (v: number | string): string => {
	if (v === null || v === undefined) return "0";
	return Number(v).toLocaleString("ko-KR");
};
// finalPrice가격의 originPrice에서의 할인율
export const discountPercent = (originPrice: number, finalPrice: number) => {
	return Math.round(((originPrice - finalPrice) / originPrice) * 100);
};
// 상품 적립 마일리지 계산
export const calculateMileage = (price: number): number => {
	if (price <= 0) return 0;

	const mileage = price * MILEAGE_RATE;
	return Math.floor(mileage / 10) * 10;
};
// 쿠폰을 적용한 가격
