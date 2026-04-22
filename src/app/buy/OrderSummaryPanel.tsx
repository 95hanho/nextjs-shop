import { FaAngleDown } from "react-icons/fa";
import styles from "./Buy.module.scss";
import { useBuy } from "@/hooks/buy/useBuy";
import { money } from "@/lib/format";
import { calculateMileage } from "@/lib/price";
import clsx from "clsx";

interface OrderSummaryPanelProps {
	buyTotalOriginPrice: number; // 할인 전 총 상품 가격 (addPrice, count 반영된 가격)
	buyTotalFinalPrice: number; // 할인 후 총 상품 가격 (addPrice, count, 쿠폰 할인 반영된 가격)
	buySelfDiscount: number; // 자체 할인가
	cartCouponDiscount: number; // 장바구니쿠폰 할인가
	sellerCouponDiscount: number; // 판매자쿠폰 할인가
	deliveryFee: number; // 배송비
}

export default function OrderSummaryPanel({
	buyTotalOriginPrice,
	buyTotalFinalPrice,
	buySelfDiscount,
	cartCouponDiscount,
	sellerCouponDiscount,
	deliveryFee,
}: OrderSummaryPanelProps) {
	// 1) [store / custom hooks] -----------------------------------
	const { handleBuy, usedMileage } = useBuy();

	return (
		<aside className={styles.aside}>
			<section className={styles.asideBox}>
				<h2 className={styles.asideTitle}>결제 금액</h2>

				<div className={styles.asideDivider} />

				<div className={styles.priceList}>
					<div className={styles.priceRow}>
						<span>총 상품 금액</span>
						<span>{money(buyTotalOriginPrice)}원</span>
					</div>
					<div className={styles.priceRow}>
						<span>배송비</span>
						<span>{money(deliveryFee)}원</span>
					</div>
					<div className={styles.priceRow}>
						<span>자체할인가</span>
						<span>{buySelfDiscount ? `-${money(buySelfDiscount)}` : 0}원</span>
					</div>
					<div className={styles.priceRow}>
						<span>쿠폰 할인 금액</span>
						<span className={styles.minus}>
							{cartCouponDiscount + sellerCouponDiscount > 0 ? `-${money(cartCouponDiscount + sellerCouponDiscount)}` : "0"}원{" "}
							<i className={styles.chevSmall}>
								<FaAngleDown />
							</i>
						</span>
					</div>
					<div className={clsx(styles.priceRow, "text-xs")}>
						<span>ㄴ장바구니 쿠폰</span>
						<span>{cartCouponDiscount ? `-${money(cartCouponDiscount)}` : 0}원</span>
					</div>
					<div className={clsx(styles.priceRow, "text-xs")}>
						<span>ㄴ판매자 쿠폰</span>
						<span>{sellerCouponDiscount ? `-${money(sellerCouponDiscount)}` : 0}원</span>
					</div>
					<div className={styles.priceRow}>
						<span>보유 적립금 사용</span>
						<span>{usedMileage ? `-${money(usedMileage)}` : 0}원</span>
					</div>
					<div className={styles.priceRowTotal}>
						<strong>총 결제 금액</strong>
						<strong className={styles.totalPrice}>{money(buyTotalFinalPrice + deliveryFee - usedMileage)}원</strong>
					</div>
				</div>

				<div className={styles.asideDividerBold} />

				<h2 className={styles.asideTitle}>적립 혜택</h2>
				<div className={styles.rewardRow}>
					<span>총 적립 혜택</span>
					<strong>{money(calculateMileage(buyTotalFinalPrice))}원</strong>
				</div>

				<div className={styles.asideDividerBold} />

				<div className={styles.agreeBox}>
					<div className={styles.agreeTitle}>주문 내용을 확인했으며, 아래 내용에 모두 동의합니다.</div>
					<button type="button" className={styles.agreeLink}>
						개인정보 수집/이용 동의 보기
					</button>
					<button type="button" className={styles.agreeLink}>
						개인정보 제3자 제공 동의 보기
					</button>
					<p className={styles.noticeText}>
						결제 및 계좌 안내 시 상호명은 <mark className={styles.brandMark}>NEXTJS-SHOP</mark>로 표기됩니다.
					</p>
				</div>

				<button className={styles.payButton} type="button" onClick={handleBuy}>
					{money(buyTotalFinalPrice + deliveryFee - usedMileage)}원 결제하기
				</button>
			</section>
		</aside>
	);
}
