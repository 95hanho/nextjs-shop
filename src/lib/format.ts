/** 돈 3번쨰 자리마다 쉼표(,) */
export const money = (v: number | string): string => {
	if (v === null || v === undefined) return "0";
	return Number(v).toLocaleString("ko-KR");
};
/**
 * 원래가격 대비 할인된 가격의 할인율 계산
 * @param originPrice 원래 가격
 * @param discountedPrice 할인된 가격
 * @returns 할인율
 */
export const discountPercent = (originPrice: number, discountedPrice: number) => {
	return Math.round(((originPrice - discountedPrice) / originPrice) * 100);
};
