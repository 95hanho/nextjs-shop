import TestImage from "@/components/test/TestImage";
import { FaSearch } from "react-icons/fa";
import { RiGlassesLine } from "react-icons/ri";

/* 주문내역페이지 */
export default function OrderHistory() {
	return (
		<main id="orderHistory" className="order-history">
			{/* 전체 래퍼 */}
			<div className="order-history__wrap">
				{/* 헤더: 타이틀 + 검색 + 메뉴 */}
				<header className="order-history__header">
					<h2 className="order-history__title">주문내역</h2>

					{/* 검색창 */}
					<div className="order-history__search">
						<input type="text" className="order-history__search-input" placeholder="상품명/브랜드명으로 검색하세요." />
						<button className="order-history__search-btn">
							<FaSearch />
						</button>
					</div>

					{/* 메뉴 탭 */}
					<nav className="order-history__nav">
						<ul className="order-history__nav-list">
							<li className="order-history__nav-item is-active">
								<a href="#">전체</a>
							</li>
							<li className="order-history__nav-item">
								<a href="#">오프라인 구매</a>
							</li>
							<li className="order-history__nav-item">
								<a href="#">상품권</a>
							</li>
							<li className="order-history__nav-item">
								<a href="#">티켓</a>
							</li>
							<li className="order-history__nav-item">
								<a href="#">픽업</a>
							</li>
						</ul>
					</nav>
				</header>

				{/* 주문 리스트 섹션 */}
				<section className="order-history__list">
					{/* 날짜별 주문 블록 */}
					<article className="order-history__group">
						<h3 className="order-history__date">
							25.06.23(월)
							<a href="#" className="order-history__detail-link">
								주문 상세
							</a>
						</h3>
						<ul className="order-history__items">
							<li className="order-history__item">
								<h5 className="order-history__status">구매확정</h5>

								{/* 상품 정보 */}
								<div className="order-history__product">
									<div className="order-history__thumb">
										<TestImage />
									</div>
									<div className="order-history__info">
										<h4 className="order-history__brand">굿라이프웍스</h4>
										<p className="order-history__name">린넨 라이크 이지 와이드 데님 팬츠 라이트인디고</p>
										<h5 className="order-history__option">L / 1개</h5>
										<h6 className="order-history__price">24,950원</h6>
									</div>
								</div>

								{/* 버튼 */}
								<div className="order-history__buttons">
									<button className="order-history__btn">배송 조회</button>
									<button className="order-history__btn order-history__btn--gray">재구매</button>
								</div>
							</li>
							<li className="order-history__item">
								<h5 className="order-history__status">구매확정</h5>

								{/* 상품 정보 */}
								<div className="order-history__product">
									<div className="order-history__thumb">
										<TestImage />
									</div>
									<div className="order-history__info">
										<h4 className="order-history__brand">굿라이프웍스</h4>
										<p className="order-history__name">린넨 라이크 이지 와이드 데님 팬츠 라이트인디고</p>
										<h5 className="order-history__option">L / 1개</h5>
										<h6 className="order-history__price">24,950원</h6>
									</div>
								</div>

								{/* 버튼 */}
								<div className="order-history__buttons">
									<button className="order-history__btn">배송 조회</button>
									<button className="order-history__btn order-history__btn--gray">재구매</button>
								</div>
							</li>
							<li className="order-history__item">
								<h5 className="order-history__status">구매확정</h5>

								{/* 상품 정보 */}
								<div className="order-history__product">
									<div className="order-history__thumb">
										<TestImage />
									</div>
									<div className="order-history__info">
										<h4 className="order-history__brand">굿라이프웍스</h4>
										<p className="order-history__name">린넨 라이크 이지 와이드 데님 팬츠 라이트인디고</p>
										<h5 className="order-history__option">L / 1개</h5>
										<h6 className="order-history__price">24,950원</h6>
									</div>
								</div>

								{/* 버튼 */}
								<div className="order-history__buttons">
									<button className="order-history__btn">배송 조회</button>
									<button className="order-history__btn order-history__btn--gray">재구매</button>
								</div>
							</li>
						</ul>
					</article>
					{/* 날짜별 주문 블록 */}
					<article className="order-history__group">
						<h3 className="order-history__date">
							25.06.23(월)
							<a href="#" className="order-history__detail-link">
								주문 상세
							</a>
						</h3>
						<ul className="order-history__items">
							<li className="order-history__item">
								<h5 className="order-history__status">구매확정</h5>

								{/* 상품 정보 */}
								<div className="order-history__product">
									<div className="order-history__thumb">
										<TestImage />
									</div>
									<div className="order-history__info">
										<h4 className="order-history__brand">굿라이프웍스</h4>
										<p className="order-history__name">린넨 라이크 이지 와이드 데님 팬츠 라이트인디고</p>
										<h5 className="order-history__option">L / 1개</h5>
										<h6 className="order-history__price">24,950원</h6>
									</div>
								</div>

								{/* 버튼 */}
								<div className="order-history__buttons">
									<button className="order-history__btn">배송 조회</button>
									<button className="order-history__btn order-history__btn--gray">재구매</button>
								</div>
							</li>
							<li className="order-history__item">
								<h5 className="order-history__status">구매확정</h5>

								{/* 상품 정보 */}
								<div className="order-history__product">
									<div className="order-history__thumb">
										<TestImage />
									</div>
									<div className="order-history__info">
										<h4 className="order-history__brand">굿라이프웍스</h4>
										<p className="order-history__name">린넨 라이크 이지 와이드 데님 팬츠 라이트인디고</p>
										<h5 className="order-history__option">L / 1개</h5>
										<h6 className="order-history__price">24,950원</h6>
									</div>
								</div>

								{/* 버튼 */}
								<div className="order-history__buttons">
									<button className="order-history__btn">배송 조회</button>
									<button className="order-history__btn order-history__btn--gray">재구매</button>
								</div>
							</li>
						</ul>
					</article>
				</section>
			</div>
		</main>
	);
}
