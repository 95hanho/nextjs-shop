import { IoMdDownload } from "react-icons/io";
import styles from "../ProductDetail.module.scss";
import clsx from "clsx";
import { GetProductDetailCouponResponse } from "@/types/product";
import { discountPercent, money } from "@/lib/format";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postJson } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { BaseResponse } from "@/types/common";

type CommonProps = {
	originPrice: number;
	finalPrice: number;
	productId: number;
};

type MyPriceCheckboxTooltipProps =
	| (CommonProps & { type: "BASE" })
	| (CommonProps & {
			type: "COUPON";
			coupon: GetProductDetailCouponResponse["availableProductCoupon"][number];
	  })
	| (CommonProps & { type: "MILEAGE"; mileage: number });

export default function MyPriceCheckboxTooltip(props: MyPriceCheckboxTooltipProps) {
	const { type, originPrice, finalPrice, productId } = props;
	const queryClient = useQueryClient();

	// 쿠폰 다운로드
	const couponDownload = useMutation({
		mutationFn: (couponId: number) => postJson<BaseResponse>(getApiUrl(API_URL.PRODUCT_COUPON_DOWNLOAD), { couponId }),
		onSuccess(data) {
			console.log("couponDownload data", data);
			queryClient.invalidateQueries({ queryKey: ["productCouponList", productId] });
		},
		onError(err) {
			console.log("couponDownload err", err);
		},
	});

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
					{coupon.userCouponId ? (
						<span className={clsx(styles.couponDownloadBtn, styles.have)}>보유중</span>
					) : (
						<button
							className={clsx(styles.couponDownloadBtn)}
							onClick={() => {
								couponDownload.mutate(coupon.couponId);
							}}
						>
							받기
							<IoMdDownload />
						</button>
					)}
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
