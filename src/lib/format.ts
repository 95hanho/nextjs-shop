export const money = (v: number | string): string => {
	if (v === null || v === undefined) return "0";
	return Number(v).toLocaleString("ko-KR");
};
export const discountPercent = (originPrice: number, finalPrice: number) => {
	return Math.round(((originPrice - finalPrice) / originPrice) * 100);
};
