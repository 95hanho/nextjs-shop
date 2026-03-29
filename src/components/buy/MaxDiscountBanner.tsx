import clsx from "clsx";
import styles from "./MaxDiscountBanner.module.scss";
import { OnOffButton } from "@/components/ui/OnOffButton";

interface MaxDiscountBannerProps {
	isMaxDiscountStatus: boolean; // 최대 할인 쿠폰이 적용됐거나, 다른 쿠폰 할인 금액 합이 최대 할인 금액과 같으면 켜짐
	changeMaxDiscountApplied: () => void; // 최대 할인 적용 상태 변경 함수
}

export const MaxDiscountBanner = ({ isMaxDiscountStatus, changeMaxDiscountApplied }: MaxDiscountBannerProps) => {
	return (
		<label htmlFor="buyMaxDiscountApplied" className={clsx(styles.couponBanner, !isMaxDiscountStatus && styles.off, "mt-3 flex justify-between")}>
			<div>{isMaxDiscountStatus ? "최대 할인이 적용됐어요." : "최대할인 적용하기"}</div>
			<OnOffButton
				checkId="buyMaxDiscountApplied"
				checked={isMaxDiscountStatus} // 최대 할인 쿠폰이 적용됐거나, 다른 쿠폰 할인 금액 합이 최대 할인 금액과 같으면 켜짐
				size="sm"
				name="maxDiscountApplied"
				onOffColor={["#DAA", "#737373"]}
				onChange={() => {
					if (!isMaxDiscountStatus) {
						changeMaxDiscountApplied();
					}
				}}
				cursor={false}
			/>
		</label>
	);
};
