import { FaAngleDown } from "react-icons/fa";
import styles from "./BuyClient.module.scss";

export default function OrderSummaryPanel() {
	return (
		<aside className={styles.aside}>
			<section className={styles.asideBox}>
				<h2 className={styles.asideTitle}>결제 금액</h2>

				<div className={styles.asideDivider} />

				<div className={styles.priceList}>
					<div className={styles.priceRow}>
						<span>총 상품 금액</span>
						<span>33,320원</span>
					</div>
					<div className={styles.priceRow}>
						<span>배송비</span>
						<span>3,000원</span>
					</div>
					<div className={styles.priceRow}>
						<span>쿠폰 할인 금액</span>
						<span className={styles.minus}>
							-6,660원{" "}
							<i className={styles.chevSmall}>
								<FaAngleDown />
							</i>
						</span>
					</div>
					<div className={styles.priceRow}>
						<span>보유 적립금 사용</span>
						<span>0원</span>
					</div>
					<div className={styles.priceRowTotal}>
						<strong>총 결제 금액</strong>
						<strong className={styles.totalPrice}>29,660원</strong>
					</div>
				</div>

				<div className={styles.asideDividerBold} />

				<h2 className={styles.asideTitle}>적립 혜택</h2>
				<div className={styles.rewardRow}>
					<span>총 적립 혜택</span>
					<strong>0원</strong>
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

				<div className={styles.benefitRow}>
					<span>이번 주문으로 받는 혜택</span>
					<span className={styles.benefitValue}>
						6,660원{" "}
						<i className={styles.chevSmall}>
							<FaAngleDown />
						</i>
					</span>
				</div>

				<button className={styles.payButton} type="button">
					29,660원 결제하기
				</button>
			</section>
		</aside>
	);
}
