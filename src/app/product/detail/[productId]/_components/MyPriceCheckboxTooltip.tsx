import { IoMdDownload } from "react-icons/io";
import styles from "../ProductDetail.module.scss";
import clsx from "clsx";
import { GetProductDetailCouponResponse } from "@/types/product";
import { discountPercent, money } from "@/lib/format";

type CommonProps = {
	originPrice: number;
	finalPrice: number;
};

type MyPriceCheckboxTooltipProps =
	| (CommonProps & { type: "BASE" })
	| (CommonProps & {
			type: "COUPON";
			coupon: GetProductDetailCouponResponse["availableProductCoupon"][number];
	  })
	| (CommonProps & { type: "MILEAGE"; mileage: number });

export default function MyPriceCheckboxTooltip(props: MyPriceCheckboxTooltipProps) {
	const { type, originPrice, finalPrice } = props;
	if (type === "BASE") {
		return (
			<div className={styles.myPriceCheckboxTooltip}>
				<div className={styles.checkbox}>
					<input type="checkbox" checked={true} disabled />
					<span>기본 할인 {discountPercent(originPrice, finalPrice)}%</span>
				</div>
				<div className={styles.discountInfo}>
					<strong>{originPrice - finalPrice}원</strong>
				</div>
			</div>
		);
	}
	if (type === "COUPON") {
		const { coupon } = props;

		return (
			<div className={clsx(styles.myPriceCheckboxTooltip, styles.disabled)}>
				<div className={styles.checkbox}>
					<input type="checkbox" />
					<span>{coupon.description}</span>
					{!coupon.isStackable && <mark>중복불가</mark>}
				</div>
				<div className={styles.discountInfo}>
					<strong>-1,160원</strong>
					{/* <button>
					받기
					<IoMdDownload />
				</button> */}
					<span className={clsx(styles.couponDownloadBtn, styles.have)}>보유중</span>
				</div>
			</div>
		);
	}
	if (type === "MILEAGE") {
		const { mileage } = props;

		return (
			<div className={clsx(styles.myPriceCheckboxTooltip, mileage === 0 && styles.disabled)}>
				<div className={styles.checkbox}>
					<input type="checkbox" disabled={mileage === 0} />
					<span>보유 적립금 사용</span>
				</div>
				<div className={styles.discountInfo}>
					{/* <strong>-1,160원</strong> */}
					<span>{money(mileage)}</span>
				</div>
			</div>
		);
	}
	return null;
}
