import { MILEAGE_RATE } from "@/lib/env";

/** 상품 적립 마일리지 계산 */
export const calculateMileage = (price: number): number => {
	if (price <= 0) return 0;

	const mileage = price * MILEAGE_RATE;
	return Math.floor(mileage / 10) * 10;
};
type CouponDiscountInfo = {
	minimumOrderBeforeAmount: number;
	discountType: "fixed_amount" | "percentage";
	discountValue: number;
	maxDiscount: number | null;
};
/**
 * 쿠폰을 적용한 가격
 * @param price 적용 전 가격
 * @param coupon 적용할 쿠폰
 * @returns 쿠폰 적용불가 null / 적용 후 가격
 */
export const calculateDiscount = (price: number, coupon: CouponDiscountInfo): number | null => {
	if (price < coupon.minimumOrderBeforeAmount) return null;

	if (coupon.discountType === "fixed_amount") {
		return coupon.discountValue;
	}
	if (coupon.discountType === "percentage") {
		const discount = Math.floor(price * (coupon.discountValue / 100));
		if (coupon.maxDiscount !== null && discount > coupon.maxDiscount) {
			return coupon.maxDiscount;
		}
		return discount;
	}
	return null;
};
