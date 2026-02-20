import { MILEAGE_RATE } from "@/lib/env";
import { GetProductDetailCouponResponse } from "@/types/product";

// 상품 적립 마일리지 계산
export const calculateMileage = (price: number): number => {
	if (price <= 0) return 0;

	const mileage = price * MILEAGE_RATE;
	return Math.floor(mileage / 10) * 10;
};
// 쿠폰을 적용한 가격
export const calculateDiscount = (price: number, coupon: GetProductDetailCouponResponse["availableProductCoupon"][number]): number | null => {
	if (price < coupon.minimumOrderBeforeAmount) return null;

	if (coupon.discountType === "fixed_amount") {
		return coupon.discountValue;
	}
	if (coupon.discountType === "percentage") {
		const discount = Math.floor(price * (coupon.discountValue / 100));
		if (discount > coupon.maxDiscount) {
			return coupon.maxDiscount;
		}
		return discount;
	}
	return null;
};
