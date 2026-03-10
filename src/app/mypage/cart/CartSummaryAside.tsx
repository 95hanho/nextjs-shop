import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import styles from "./CartClient.module.scss";
import { useState } from "react";
import { SmartImage } from "@/components/ui/SmartImage";

interface CartSummaryAsideProps {
	selectedCount: number;
}

// 우측: 요약/혜택/유의사항/CTA
export default function CartSummaryAside({ selectedCount }: CartSummaryAsideProps) {
	// 유의사항 on/off
	const [noticeOpen, setNoticeOpen] = useState(false);

	return (
		<aside className={styles.priceWrap} aria-label="주문 요약">
			<div className={`${styles.priceOutline} ${styles.summaryCard}`}>
				<div className={`${styles.priceCount} ${styles.summaryCardSection}`}>
					<div className={`${styles.title} ${styles.summaryCardTitle}`}>구매금액</div>

					<div className={styles.priceLine}>
						<div className={styles.infoName}>상품 금액</div>
						<div className={styles.priceNum} data-field="subtotal">
							185,000원
						</div>
					</div>

					<div className={styles.priceLine}>
						<div>할인 금액</div>
						<div className="text-blue-700">-39,960원</div>
					</div>

					<div className={styles.priceLine}>
						<div>배송비</div>
						<div className="text-blue-700">무료배송</div>
					</div>

					<div className={`mt-4 font-bold ${styles.priceLine} ${styles.priceLineTotal}`}>
						<div>총 구매 금액</div>
						<div aria-live="polite">
							<span className="mr-2 text-red-500 align-baseline summary__badge">22%</span>
							<span className="align-baseline" data-field="total">
								145,040원
							</span>
						</div>
					</div>

					<div className={styles.priceLine}>
						<div>적립혜택 예상</div>
						<div>최대 5,120</div>
					</div>
				</div>

				<hr className={styles.summaryCardDivider} />

				<div className={`${styles.priceBenefit} ${styles.benefit}`} aria-label="결제 혜택">
					<div className={`${styles.title} ${styles.benefitHeader}`}>
						<div className={styles.benefitTitle}>결제 혜택</div>
						<div className={`text-sm ${styles.benefitMore}`}>
							<a href="#" className="text-gray-600 underline">
								더보기
							</a>
						</div>
					</div>

					<div className={styles.benefitBody}>
						<h3 className={styles.benefitSubtitle}>즉시 할인</h3>

						<div className={`${styles.benefitItem} ${styles.kakaopay}`}>
							<i className={styles.benefitIcon}>
								<SmartImage src="/images/kakaopay-seeklogo.png" alt="카카오페이이미지" width={30} height={30} />
							</i>
							<span className={styles.benefitText}>
								카카오페이 × 페이머니 <span>8만원 이상 결제 시 4천원 즉시 할인</span>
							</span>
						</div>

						<div className={`${styles.benefitItem} ${styles.samsungpay}`}>
							<i className={styles.benefitIcon}>
								<img src="/images/Samsung Pay_2025_hor_rev_RGB.png" alt="삼성페이이미지" />
							</i>
							<span className={styles.benefitText}>
								삼성페이 x 삼성카드 <span>3만원 이상 결제시 3천원 즉시 할인</span>
							</span>
						</div>

						<div className={styles.benefitItem}>
							<i className={styles.benefitIcon}>
								<img src="/images/btn_Vertical-cr_napygr.svg" alt="네이버페이이미지" />
							</i>
							<span className={styles.benefitText}>
								네이버페이 x 신한카드 <span>2만원 이상 결제시 2천원 즉시 할인</span>
							</span>
						</div>
					</div>
				</div>

				<hr className={styles.summaryCardDivider} />

				<div className={styles.summaryCardNotice}>
					<button className={styles.noticeToggle} type="button" onClick={() => setNoticeOpen(!noticeOpen)}>
						유의사항 {noticeOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
					</button>
				</div>
			</div>

			{noticeOpen && (
				<div className={styles.noticeWrap}>
					<ul className={`${styles.noticeList} text-xs`}>
						<li>무신사는 제주/도서산간 지역 제외 전 지역, 전 상품 무료 배송입니다.</li>
						<li>주문완료 후 출고 전 배송지 변경은 동일 권역(일반, 제주, 제주 외 도서산간 지역) 내에서만 가능합니다.</li>
						<li>2개 이상의 브랜드를 주문하신 경우, 개별 배송됩니다.</li>
						<li>결제 시 각종 할인 적용이 달라질 수 있습니다.</li>
						<li>일부 지역에는 내일도착 보장 서비스가 제공되지 않습니다.</li>
						<li>해외배송 상품은 배송료가 추가로 발생될 수 있습니다.</li>
						<li>장바구니 상품은 최대 1년 보관(비회원 2일)되며 담은 시점과 현재의 판매 가격이 달라질 수 있습니다.</li>
						<li>장바구니에는 최대 100개의 상품을 보관할 수 있으며, 주문당 한번에 주문 가능한 상품수는 100개로 제한됩니다.</li>
					</ul>
				</div>
			)}

			<div>
				<button className="w-full px-5 py-3 mt-3 btn--black">145,040원 구매하기 ({selectedCount}개)</button>
			</div>
		</aside>
	);
}
