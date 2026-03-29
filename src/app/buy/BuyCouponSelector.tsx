import styles from "./Buy.module.scss";
import clsx from "clsx";
import { calculateDiscount } from "@/lib/price";
import { AppliedCartCoupon } from "@/app/mypage/cart/CartClient";
import { TooltipIcon } from "@/components/ui/TooltipIcon";
import { money } from "@/lib/format";

type BuyCouponSelectorProps = {
	finalXCount: number;
	coupon: AppliedCartCoupon;
	handleCheckAppliedProductCoupon: (isAdd: boolean) => void;
	couponChecked: boolean;
	otherUsed: boolean;
	productOptionId: number;
};

export default function BuyCouponSelector(props: BuyCouponSelectorProps) {
	const { finalXCount } = props;

	const { coupon, handleCheckAppliedProductCoupon, couponChecked, otherUsed, productOptionId } = props;

	const isDiscountApplied = calculateDiscount(finalXCount, coupon);
	const disabled = !isDiscountApplied || otherUsed; // 할인 적용 불가 or 다른 쿠폰 사용중인 경우

	return (
		<div className={clsx(styles.myPriceCheckboxTooltip, disabled ? styles.disabled : "")}>
			<div className={styles.checkbox}>
				<input
					id={`coupon-${productOptionId}-${coupon.couponId}`}
					type="checkbox"
					disabled={disabled}
					checked={couponChecked}
					onChange={() => {
						handleCheckAppliedProductCoupon(!couponChecked);
					}}
				/>
				<label htmlFor={`coupon-${productOptionId}-${coupon.couponId}`} title={coupon.description}>
					<span className={coupon.isStackable ? styles.isStackable : ""}>{coupon.description}</span>
					{!coupon.isStackable && <mark>중복불가</mark>}
				</label>
			</div>
			<div className={styles.discountInfo}>
				{isDiscountApplied ? (
					<>{otherUsed ? <span className="text-gray-400">다른 쿠폰 사용중</span> : <strong>-{money(isDiscountApplied)}</strong>}</>
				) : (
					<span className="inline-flex items-center w-100px">
						<strong className="text-[10px] text-red-500">적용불가</strong>
						<TooltipIcon
							tooltipText={`[최소 주문 금액:${money(coupon.minimumOrderBeforeAmount)}원]수량을 늘리거나, 같은 판매자 상품을 함께 구매하면 적용될 수 있어요.`}
						/>
					</span>
				)}
			</div>
		</div>
	);
}
