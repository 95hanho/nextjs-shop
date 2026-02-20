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
import { calculateDiscount } from "@/lib/price";
import { FaQuestion } from "react-icons/fa";
import { TooltipIcon } from "@/components/ui/TooltipIcon";
import { ProductCouponWithDiscount } from "@/app/product/detail/[productId]/_components/ProductVisualInfo";

type CommonProps = {
	originPrice: number;
	finalPrice: number;
	productId: number;
};

type MyPriceCheckboxTooltipProps =
	| (CommonProps & { type: "BASE" })
	| (CommonProps & {
			type: "COUPON";
			coupon: ProductCouponWithDiscount;
			setAppliedProductCoupon: (isAdd: boolean) => void;
			couponChecked: boolean;
	  })
	| (CommonProps & { type: "MILEAGE"; mileage: number; setMileageUse: () => void; couponChecked: boolean; useMileage: number });

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
					<strong>{`-${money(originPrice - finalPrice)}원`}</strong>
				</div>
			</div>
		);
	}
	if (type === "COUPON") {
		const { coupon, setAppliedProductCoupon, couponChecked } = props;

		const isDiscountApplied = calculateDiscount(finalPrice, coupon);

		return (
			<div className={clsx(styles.myPriceCheckboxTooltip, isDiscountApplied ? "" : styles.disabled)}>
				<div className={styles.checkbox}>
					<input
						type="checkbox"
						disabled={!isDiscountApplied}
						checked={couponChecked}
						onChange={() => {
							setAppliedProductCoupon(!couponChecked);
						}}
					/>
					<span>{coupon.description}</span>
					{!coupon.isStackable && <mark>중복불가</mark>}
				</div>
				<div className={styles.discountInfo}>
					{isDiscountApplied ? (
						<strong>-{money(isDiscountApplied)}</strong>
					) : (
						<span className="inline-flex items-center w-100px">
							<strong className="text-[10px] text-red-500">적용불가</strong>
							<TooltipIcon tooltipText="수량을 늘리거나, 같은 판매자 상품을 함께 구매하면 적용될 수 있어요." />
						</span>
					)}
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
		const { mileage, setMileageUse, couponChecked, useMileage } = props;

		return (
			<div className={clsx(styles.myPriceCheckboxTooltip, mileage === 0 && styles.disabled)}>
				<div className={styles.checkbox}>
					<input type="checkbox" disabled={mileage === 0} checked={couponChecked && mileage > 0} onChange={setMileageUse} />
					<span>보유 적립금 사용</span>
				</div>
				<div className={styles.discountInfo}>
					{/* <strong>-1,160원</strong> */}
					{couponChecked ? (
						<span className={styles.mileageUsed}>
							<span>-{money(useMileage)}</span>
						</span>
					) : (
						<span>
							{mileage > 0 ? (
								<>
									<span>{money(mileage)}</span> <span className="text-[10px] text-gray-700">보유중</span>
								</>
							) : (
								<span className="text-[10px] text-gray-500">보유 적립금 없음</span>
							)}
						</span>
					)}
				</div>
			</div>
		);
	}
	return null;
}
