import { FaAngleDown, FaQuestion } from "react-icons/fa";
import styles from "./BuyClient.module.scss";
import { BsExclamationCircle } from "react-icons/bs";

export default function OrderFormSection() {
	return (
		<section className={styles.main}>
			{/* 배송 정보 */}
			<article className={styles.block}>
				<header className={styles.blockHeader}>
					<div className={styles.blockTitleRow}>
						<div className={styles.blockTitle}>
							<span>배송 정보</span>
							<i className={styles.iconCircle}>
								<FaQuestion />
							</i>
						</div>

						<div className={styles.requiredInfo}>
							<mark className={styles.requiredMark}>*</mark>
							<span>표시는 필수입력 항목</span>
						</div>
					</div>

					<nav className={styles.tabs}>
						<button type="button" className={`${styles.tab} ${styles.active}`}>
							기존 배송지
						</button>
						<button type="button" className={styles.tab}>
							신규입력
						</button>
					</nav>
				</header>

				<div className={styles.form}>
					{/* row */}
					<div className={styles.formRow}>
						<div className={styles.formLabel}>배송지명</div>
						<div className={styles.formField}>
							<div className={styles.inlineBetween}>
								<input className={styles.input} type="text" />
								<a className={styles.link} href="">
									이전 배송지 목록
								</a>
							</div>
						</div>
					</div>

					<div className={styles.formRow}>
						<div className={styles.formLabel}>
							수령인 <mark className={styles.requiredMark}>*</mark>
						</div>
						<div className={styles.formField}>
							<input className={styles.input} type="text" />
						</div>
					</div>

					<div className={styles.formRow}>
						<div className={styles.formLabel}>
							배송지 <mark className={styles.requiredMark}>*</mark>
						</div>

						<div className={styles.formField}>
							<div className={styles.addressGroup}>
								<div className={styles.addressTop}>
									<div className={styles.postcode}>16828</div>
									<button type="button" className={styles.grayBtn}>
										우편번호 검색
									</button>
								</div>

								<div className={styles.addressLine}>경기 용인시 수지구 수풍로116번길 10</div>
								<input className={styles.input} type="text" defaultValue="102호" />
							</div>
						</div>
					</div>

					<div className={styles.formRow}>
						<div className={styles.formLabel}>
							연락처 1 <mark className={styles.requiredMark}>*</mark>
						</div>
						<div className={styles.formField}>
							<div className={styles.phoneGroup}>
								<input className={styles.phoneInput} type="text" />
								<span className={styles.hyphen}>-</span>
								<input className={styles.phoneInput} type="text" />
								<span className={styles.hyphen}>-</span>
								<input className={styles.phoneInput} type="text" />
							</div>
						</div>
					</div>

					<div className={styles.formRow}>
						<div className={styles.formLabel}>연락처 2</div>
						<div className={styles.formField}>
							<div className={styles.phoneGroup}>
								<input className={styles.phoneInput} type="text" />
								<span className={styles.hyphen}>-</span>
								<input className={styles.phoneInput} type="text" />
								<span className={styles.hyphen}>-</span>
								<input className={styles.phoneInput} type="text" />
							</div>

							<p className={styles.helperText}>기본 배송지입니다. 주문 시 변경하신 내용으로 기본 배송지 주소가 수정됩니다.</p>

							{/* 배송 메모 셀렉터 자리 */}
							<div className={styles.selectRow}>
								<button type="button" className={styles.selectLikeBtn}>
									문앞X 원룸정문1597# 우편함오른쪽 밑 보관함
									<i className={styles.chev}>
										<FaAngleDown />
									</i>
								</button>
							</div>
						</div>
					</div>
				</div>
			</article>

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
