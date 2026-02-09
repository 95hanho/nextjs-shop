import TestImage from "@/components/test/TestImage";
import { FaSearch } from "react-icons/fa";
import styles from "./OrderHistoryClient.module.scss";

export default function OrderHistoryClient() {
	return (
		<main id="orderHistory" className={styles.orderHistory}>
			{/* 전체 래퍼 */}
			<div className={styles.orderHistoryWrap}>
				{/* 헤더: 타이틀 + 검색 + 메뉴 */}
				<header className={styles.orderHistoryHeader}>
					<h2 className={styles.orderHistoryTitle}>주문내역</h2>

					{/* 검색창 */}
					<div className={styles.orderHistorySearch}>
						<input type="text" className={styles.orderHistorySearchInput} placeholder="상품명/브랜드명으로 검색하세요." />
						<button className={styles.orderHistorySearchBtn}>
							<FaSearch />
						</button>
					</div>

					{/* 메뉴 탭 */}
					<nav className={styles.orderHistoryNav}>
						<ul className={styles.orderHistoryNavList}>
							<li className={`${styles.orderHistoryNavItem} ${styles.isActive}`}>
								<a href="#">전체</a>
							</li>
							<li className={styles.orderHistoryNavItem}>
								<a href="#">오프라인 구매</a>
							</li>
							<li className={styles.orderHistoryNavItem}>
								<a href="#">상품권</a>
							</li>
							<li className={styles.orderHistoryNavItem}>
								<a href="#">티켓</a>
							</li>
							<li className={styles.orderHistoryNavItem}>
								<a href="#">픽업</a>
							</li>
						</ul>
					</nav>
				</header>

				{/* 주문 리스트 섹션 */}
				<section className={styles.orderHistoryList}>
					{/* 날짜별 주문 블록 */}
					<article className={styles.orderHistoryGroup}>
						<h3 className={styles.orderHistoryDate}>
							25.06.23(월)
							<a href="#" className={styles.orderHistoryDetailLink}>
								주문 상세
							</a>
						</h3>

						<ul className={styles.orderHistoryItems}>
							<li className={styles.orderHistoryItem}>
								<h5 className={styles.orderHistoryStatus}>구매확정</h5>

								{/* 상품 정보 */}
								<div className={styles.orderHistoryProduct}>
									<div className={styles.orderHistoryThumb}>
										<TestImage />
									</div>

									<div className={styles.orderHistoryInfo}>
										<h4 className={styles.orderHistoryBrand}>굿라이프웍스</h4>
										<p className={styles.orderHistoryName}>린넨 라이크 이지 와이드 데님 팬츠 라이트인디고</p>
										<h5 className={styles.orderHistoryOption}>L / 1개</h5>
										<h6 className={styles.orderHistoryPrice}>24,950원</h6>
									</div>
								</div>

								{/* 버튼 */}
								<div className={styles.orderHistoryButtons}>
									<button className={styles.orderHistoryBtn}>배송 조회</button>
									<button className={`${styles.orderHistoryBtn} ${styles.orderHistoryBtnGray}`}>재구매</button>
								</div>
							</li>

							<li className={styles.orderHistoryItem}>
								<h5 className={styles.orderHistoryStatus}>구매확정</h5>

								{/* 상품 정보 */}
								<div className={styles.orderHistoryProduct}>
									<div className={styles.orderHistoryThumb}>
										<TestImage />
									</div>

									<div className={styles.orderHistoryInfo}>
										<h4 className={styles.orderHistoryBrand}>굿라이프웍스</h4>
										<p className={styles.orderHistoryName}>린넨 라이크 이지 와이드 데님 팬츠 라이트인디고</p>
										<h5 className={styles.orderHistoryOption}>L / 1개</h5>
										<h6 className={styles.orderHistoryPrice}>24,950원</h6>
									</div>
								</div>

								{/* 버튼 */}
								<div className={styles.orderHistoryButtons}>
									<button className={styles.orderHistoryBtn}>배송 조회</button>
									<button className={`${styles.orderHistoryBtn} ${styles.orderHistoryBtnGray}`}>재구매</button>
								</div>
							</li>

							<li className={styles.orderHistoryItem}>
								<h5 className={styles.orderHistoryStatus}>구매확정</h5>

								{/* 상품 정보 */}
								<div className={styles.orderHistoryProduct}>
									<div className={styles.orderHistoryThumb}>
										<TestImage />
									</div>

									<div className={styles.orderHistoryInfo}>
										<h4 className={styles.orderHistoryBrand}>굿라이프웍스</h4>
										<p className={styles.orderHistoryName}>린넨 라이크 이지 와이드 데님 팬츠 라이트인디고</p>
										<h5 className={styles.orderHistoryOption}>L / 1개</h5>
										<h6 className={styles.orderHistoryPrice}>24,950원</h6>
									</div>
								</div>

								{/* 버튼 */}
								<div className={styles.orderHistoryButtons}>
									<button className={styles.orderHistoryBtn}>배송 조회</button>
									<button className={`${styles.orderHistoryBtn} ${styles.orderHistoryBtnGray}`}>재구매</button>
								</div>
							</li>
						</ul>
					</article>

					{/* 날짜별 주문 블록 */}
					<article className={styles.orderHistoryGroup}>
						<h3 className={styles.orderHistoryDate}>
							25.06.23(월)
							<a href="#" className={styles.orderHistoryDetailLink}>
								주문 상세
							</a>
						</h3>

						<ul className={styles.orderHistoryItems}>
							<li className={styles.orderHistoryItem}>
								<h5 className={styles.orderHistoryStatus}>구매확정</h5>

								{/* 상품 정보 */}
								<div className={styles.orderHistoryProduct}>
									<div className={styles.orderHistoryThumb}>
										<TestImage />
									</div>

									<div className={styles.orderHistoryInfo}>
										<h4 className={styles.orderHistoryBrand}>굿라이프웍스</h4>
										<p className={styles.orderHistoryName}>린넨 라이크 이지 와이드 데님 팬츠 라이트인디고</p>
										<h5 className={styles.orderHistoryOption}>L / 1개</h5>
										<h6 className={styles.orderHistoryPrice}>24,950원</h6>
									</div>
								</div>

								{/* 버튼 */}
								<div className={styles.orderHistoryButtons}>
									<button className={styles.orderHistoryBtn}>배송 조회</button>
									<button className={`${styles.orderHistoryBtn} ${styles.orderHistoryBtnGray}`}>재구매</button>
								</div>
							</li>

							<li className={styles.orderHistoryItem}>
								<h5 className={styles.orderHistoryStatus}>구매확정</h5>

								{/* 상품 정보 */}
								<div className={styles.orderHistoryProduct}>
									<div className={styles.orderHistoryThumb}>
										<TestImage />
									</div>

									<div className={styles.orderHistoryInfo}>
										<h4 className={styles.orderHistoryBrand}>굿라이프웍스</h4>
										<p className={styles.orderHistoryName}>린넨 라이크 이지 와이드 데님 팬츠 라이트인디고</p>
										<h5 className={styles.orderHistoryOption}>L / 1개</h5>
										<h6 className={styles.orderHistoryPrice}>24,950원</h6>
									</div>
								</div>

								{/* 버튼 */}
								<div className={styles.orderHistoryButtons}>
									<button className={styles.orderHistoryBtn}>배송 조회</button>
									<button className={`${styles.orderHistoryBtn} ${styles.orderHistoryBtnGray}`}>재구매</button>
								</div>
							</li>
						</ul>
					</article>
				</section>
			</div>
		</main>
	);
}
