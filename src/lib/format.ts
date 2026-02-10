import { MILEAGE_RATE } from "@/lib/env";

export const money = (v: number | string): string => {
	if (v === null || v === undefined) return "0";
	return Number(v).toLocaleString("ko-KR");
};
export const discountPercent = (originPrice: number, finalPrice: number) => {
	return Math.round(((originPrice - finalPrice) / originPrice) * 100);
};
export const calculateMileage = (price: number): number => {
	if (price <= 0) return 0;

	const mileage = price * MILEAGE_RATE;
	return Math.floor(mileage / 10) * 10;
};
