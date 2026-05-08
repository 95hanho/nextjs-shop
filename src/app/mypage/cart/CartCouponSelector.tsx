import styles from "./Cart.module.scss";
import clsx from "clsx";
import { calculateDiscount } from "@/lib/price";
import { AppliedCartCoupon } from "@/app/mypage/cart/CartClient";
import { discountPercent, money } from "@/lib/format";
import { TooltipIcon } from "@/components/ui/TooltipIcon";
import { IoMdDownload } from "react-icons/io";
import { useCouponDownload } from "@/hooks/query/mypage/useCouponDownload";

type CommonProps = {
	finalXQuantity: number;
};

type CartCouponSelectorProps =
	| (CommonProps & { type: "BASE"; originXQuantity: number })
	| (CommonProps & {
			type: "COUPON";
			coupon: AppliedCartCoupon;
			handleCheckAppliedProductCoupon: (isAdd: boolean) => void;
			couponChecked: boolean;
			otherUsed: boolean;
			productOptionId: number;
			handleAfterCouponDownload?: () => void;
	  });

export default function CartCouponSelector(props: CartCouponSelectorProps) {
	const { finalXQuantity, type } = props;

	// 3) [useQuery / useMutation] -----------------------------------------
	const { mutate: couponDownload } = useCouponDownload();

	if (type === "BASE") {
		const { originXQuantity } = props;

		return (
			<div className={styles.myPriceCheckboxTooltip}>
				<div className={styles.checkbox}>
					<input type="checkbox" checked disabled />
					<span>기본 할인 {discountPercent(originXQuantity, finalXQuantity)}%</span>
				</div>
				<div className={styles.discountInfo}>
					<strong>{`-${money(originXQuantity - finalXQuantity)}원`}</strong>
				</div>
			</div>
		);
	}
	if (type === "COUPON") {
		const { coupon, handleCheckAppliedProductCoupon, couponChecked, otherUsed, productOptionId } = props;

		// 4) [derived values / useMemo] -------------------------------
		const isDiscountApplied = calculateDiscount(finalXQuantity, coupon);
		const disabled = !isDiscountApplied || otherUsed; // 할인 적용 불가 or 다른 쿠폰 사용중인 경우

		return (
			<div className={clsx(styles.myPriceCheckboxTooltip, disabled ? styles.disabled : "")}>
				<div className={styles.checkbox}>
					<input
						id={`coupon-${productOptionId}-${coupon.couponId}`}
						type="checkbox"
						disabled={disabled}
						checked={couponChecked || false}
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
							<span className="mb-[2px] ml-1">
								<TooltipIcon
									tooltipText={`[최소 주문 금액:${money(coupon.minimumOrderBeforeAmount)}원]수량을 늘리거나, 같은 판매자 상품을 함께 구매하면 적용될 수 있어요.`}
								/>
							</span>
						</span>
					)}
					{!(isDiscountApplied && otherUsed) && (
						<>
							{coupon.userCouponId ? (
								<span className={clsx(styles.couponDownloadBtn, styles.have)}>보유중</span>
							) : (
								<button
									className={clsx(styles.couponDownloadBtn)}
									onClick={() => {
										couponDownload(coupon.couponId, {
											onSuccess() {
												if (type === "COUPON") {
													if (props.handleAfterCouponDownload) props.handleAfterCouponDownload();
												}
											},
										});
									}}
								>
									받기
									<IoMdDownload />
								</button>
							)}
						</>
					)}
				</div>
			</div>
		);
	}
	return null;
}
