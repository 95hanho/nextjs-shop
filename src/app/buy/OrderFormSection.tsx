import styles from "./BuyClient.module.scss";
import { BsExclamationCircle } from "react-icons/bs";
import ShippingAddressForm from "@/app/buy/ShippingAddressForm";
import { BuyItemWishCoupon } from "@/app/buy/BuyClient";
import { money } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";

interface OrderFormSectionProps {
	buyItemList: BuyItemWishCoupon[];
}

export default function OrderFormSection({ buyItemList }: OrderFormSectionProps) {
	const { user } = useAuth();

	return (
		<section className={styles.main}>
			{/* 배송 정보 */}
			<ShippingAddressForm />

			{/* 쿠폰 사용 및 상품 정보 */}
			<article className={styles.block}>
				<header className={styles.blockHeader}>
					<div className={styles.blockTitleRow}>
						<div className={styles.blockTitle}>쿠폰 사용 및 상품 정보 / 총 {buyItemList.length}개</div>
					</div>
				</header>

				<div className={styles.couponBanner}>
					{/* <OnOffButton text="최대 할인이 적용됐어요." /> */}
					<div className={styles.bannerText}>최대 할인이 적용됐어요.</div>
				</div>

				{buyItemList.map((item) => {
					const initialOriginPrice = (item.originPrice + item.addPrice) * item.count;
					const initialFinalPrice = (item.finalPrice + item.addPrice) * item.count;

					return (
						<div key={"buyItem-" + item.holdId} className={styles.productCard}>
							<div className={styles.productRow}>
								<div className={styles.thumb} />

								<div className={styles.productInfo}>
									<a className={styles.brandLink} href="">
										{item.sellerName}
									</a>
									<h3 className={styles.productName}>{item.productName}</h3>

									<div>
										<del>{money(initialOriginPrice)}원</del>
									</div>
									<div className={styles.productPriceRow}>
										<span className={styles.productBase}>
											{money(initialFinalPrice)}원 / 수량 {item.count}개
										</span>
										<mark className={styles.productApplied}>쿠폰적용가 : {money(item.discountedPrice)}원</mark>
									</div>

									<div className={styles.couponBox}>
										<div className={styles.couponLine}>
											<span className={styles.couponLabel}>상품 쿠폰</span>
											<span className={styles.couponDesc}>[20% 혜택] 일상에 감동을 더해줄 20% 쿠폰</span>
											<span className={styles.couponPrice}>6,660</span>
										</div>
										<div className={styles.couponLine}>
											<span className={styles.couponLabel}>장바구니 쿠폰</span>
											<span className={styles.couponDesc}>중복 불가 상품 쿠폰 사용중</span>
										</div>
									</div>
								</div>
							</div>

							<div className={styles.couponSummary}>
								<div className={styles.summaryRow}>
									<span className={styles.summaryLabel}>쿠폰 할인 금액</span>
									<span className={styles.summaryValueMinus}>-{money(item.discountedPrice)}원</span>
								</div>

								<button type="button" className={styles.outlineBtn}>
									쿠폰 변경
								</button>
							</div>
						</div>
					);
				})}
			</article>

			{/* 보유 적립금 사용 */}
			<article className={styles.block}>
				<header className={styles.blockHeader}>
					<div className={styles.blockTitleRow}>
						<div className={styles.blockTitle}>
							<span>보유 적립금 사용</span>
							<i className={styles.iconMuted}>
								<BsExclamationCircle />
							</i>
						</div>
					</div>
				</header>

				<div className={styles.pointRow}>
					<div className={styles.pointLabel}>사용 금액 입력</div>

					<div className={styles.pointField}>
						<div className={styles.pointInputRow}>
							<input className={styles.pointInput} type="text" defaultValue="0" />
							<button type="button" className={styles.disabledBtn}>
								모두 사용
							</button>
							<span className={styles.pointText}>
								사용 가능 {money(user.mileage)}원 / 보유 {money(user.mileage)}원
							</span>
						</div>
					</div>
				</div>
			</article>

			{/* 결제 방법 (2개만) */}
			<article className={styles.block}>
				<header className={styles.blockHeader}>
					<div className={styles.blockTitleRow}>
						<div className={styles.blockTitle}>결제 방법</div>
					</div>
				</header>

				<div className={styles.payList}>
					<label className={styles.payItem}>
						<input type="radio" name="pay" defaultChecked />
						<span>신용카드</span>
					</label>

					<label className={styles.payItem}>
						<input type="radio" name="pay" />
						<span>계좌이체</span>
					</label>
				</div>
			</article>
		</section>
	);
}
