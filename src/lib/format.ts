// 돈 3번쨰 자리마다 쉼표(,)
export const money = (v: number | string): string => {
	if (v === null || v === undefined) return "0";
	return Number(v).toLocaleString("ko-KR");
};
// finalPrice가격의 originPrice에서의 할인율
export const discountPercent = (originPrice: number, discountedPrice: number) => {
	return Math.round(((originPrice - discountedPrice) / originPrice) * 100);
};
