import styles from "./BuyClient.module.scss";
import { BsExclamationCircle } from "react-icons/bs";
import ShippingAddressForm from "@/app/buy/ShippingAddressForm";

// interface OrderFormSectionProps {}

export default function OrderFormSection() {
	return (
		<section className={styles.main}>
			{/* 배송 정보 */}
			<ShippingAddressForm />

			{/* 쿠폰 사용 및 상품 정보 */}
			<article className={styles.block}>
				<header className={styles.blockHeader}>
					<div className={styles.blockTitleRow}>
						<div className={styles.blockTitle}>쿠폰 사용 및 상품 정보 / 총 1개</div>
					</div>
				</header>

				<div className={styles.couponBanner}>
					{/* <OnOffButton text="최대 할인이 적용됐어요." /> */}
					<div className={styles.bannerText}>최대 할인이 적용됐어요.</div>
				</div>

				<div className={styles.productCard}>
					<div className={styles.productRow}>
						<div className={styles.thumb} />

						<div className={styles.productInfo}>
							<a className={styles.brandLink} href="">
								호텔파리칠
							</a>
							<h3 className={styles.productName}>[Gift Set] Cherie Wine Glass (2EA)</h3>

							<div className={styles.productPriceRow}>
								<span className={styles.productBase}>33,320원 / 수량 1개</span>
								<mark className={styles.productApplied}>쿠폰적용가 : 26,660원</mark>
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
							<span className={styles.summaryValueMinus}>-6,660원</span>
						</div>

						<button type="button" className={styles.outlineBtn}>
							쿠폰 변경
						</button>
					</div>
				</div>
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
							<span className={styles.pointText}>사용 가능 0원 / 보유 0원</span>
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
