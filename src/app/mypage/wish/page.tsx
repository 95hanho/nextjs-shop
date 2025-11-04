import Image from "next/image";
import { FaHeart, FaStar } from "react-icons/fa";

// 위시 페이지
export default function Wish() {
	return (
		<main id="wish" className="wish">
			{/* 상단 선택메뉴 */}
			<header className="wish__header">
				<div className="wish__title">
					<span>좋아요</span>
				</div>
				<nav className="wish__nav">
					<div className="wish__tabs wish__tabs--category">
						<ul className="tab__list">
							<li className="tab__item on">상품 4</li>
							<li className="tab__item">브랜드 2</li>
						</ul>
					</div>

					<div className="wish__tabs wish__tabs--filter">
						<ul className="tab__list">
							<li className="tab__item on">전체</li>
							<li className="tab__item">신발</li>
							<li className="tab__item">바지</li>
						</ul>
					</div>
				</nav>
			</header>
			{/* 상품들 */}
			<section className="wish__content">
				{/* 상품 필터 on/off 버튼 */}
				<div className="wish__filters">
					<div className="onoff-btn-wrap">
						<input type="checkbox" id="sale-switch" name="sale" className="onf-checkbox" />
						<label htmlFor="sale-switch" className="switch-label">
							<span className="onf-btn"></span>
						</label>
						<label htmlFor="sale-switch" className="onf-txt">
							세일중
						</label>
					</div>

					<div className="onoff-btn-wrap">
						<input type="checkbox" id="selling-switch" name="selling" className="onf-checkbox" />
						<label htmlFor="selling-switch" className="switch-label">
							<span className="onf-btn"></span>
						</label>
						<label htmlFor="selling-switch" className="onf-txt">
							판매 중 상품만 보기
						</label>
					</div>
				</div>
				{/* 상품 리스트 */}
				<div className="wish__list">
					{/* 각 상품들 */}
					<div className="wish__item">
						{/* 이미지 */}
						<div className="product__thumb">
							<Image src={"https://ehfqntuqntu.cdn1.cafe24.com/main/4.jpg"} alt="" fill className="product__img" />
							<div className="product__wish-btn">
								<FaHeart />
							</div>
						</div>
						{/* 하단 상품설명 */}
						<div className="product__info">
							<h4 className="product__brand">포트너스</h4>
							<h5 className="product__name">Light Two Tuck Wide Jeans (L.Blue)</h5>

							<div className="product__price">
								<div aria-live="polite">
									<span className="summary__badge text-red-500 mr-1">22%</span>
									<span className="summary__price">145,040원</span>
								</div>
							</div>
							<div className="product__meta">
								<div className="meta__wish">
									<span className="meta__icon">
										<FaHeart />
									</span>
									<span className="meta__count">2.0만</span>
								</div>

								<div className="meta__rate">
									<span className="meta__icon">
										<FaStar />
									</span>
									<span className="meta__count">4.9(6천+)</span>
								</div>
							</div>
						</div>
					</div>
					<div className="wish__item">
						{/* 이미지 */}
						<div className="product__thumb">
							<Image src={"https://ehfqntuqntu.cdn1.cafe24.com/main/4.jpg"} alt="" fill className="product__img" />
							<div className="product__wish-btn">
								<FaHeart />
							</div>
						</div>
						{/* 하단 상품설명 */}
						<div className="product__info">
							<h4 className="product__brand">포트너스</h4>
							<h5 className="product__name">Light Two Tuck Wide Jeans (L.Blue)</h5>

							<div className="product__price">
								<div aria-live="polite">
									<span className="summary__badge text-red-500 mr-1">22%</span>
									<span className="summary__price">145,040원</span>
								</div>
							</div>
							<div className="product__meta">
								<div className="meta__wish">
									<span className="meta__icon">
										<FaHeart />
									</span>
									<span className="meta__count">2.0만</span>
								</div>

								<div className="meta__rate">
									<span className="meta__icon">
										<FaStar />
									</span>
									<span className="meta__count">4.9(6천+)</span>
								</div>
							</div>
						</div>
					</div>
					<div className="wish__item">
						{/* 이미지 */}
						<div className="product__thumb">
							<Image src={"https://ehfqntuqntu.cdn1.cafe24.com/main/4.jpg"} alt="" fill className="product__img" />
							<div className="product__wish-btn">
								<FaHeart />
							</div>
						</div>
						{/* 하단 상품설명 */}
						<div className="product__info">
							<h4 className="product__brand">포트너스</h4>
							<h5 className="product__name">Light Two Tuck Wide Jeans (L.Blue)</h5>

							<div className="product__price">
								<div aria-live="polite">
									<span className="summary__badge text-red-500 mr-1">22%</span>
									<span className="summary__price">145,040원</span>
								</div>
							</div>
							<div className="product__meta">
								<div className="meta__wish">
									<span className="meta__icon">
										<FaHeart />
									</span>
									<span className="meta__count">2.0만</span>
								</div>

								<div className="meta__rate">
									<span className="meta__icon">
										<FaStar />
									</span>
									<span className="meta__count">4.9(6천+)</span>
								</div>
							</div>
						</div>
					</div>
					<div className="wish__item">
						{/* 이미지 */}
						<div className="product__thumb">
							<Image src={"https://ehfqntuqntu.cdn1.cafe24.com/main/4.jpg"} alt="" fill className="product__img" />
							<div className="product__wish-btn">
								<FaHeart />
							</div>
						</div>
						{/* 하단 상품설명 */}
						<div className="product__info">
							<h4 className="product__brand">포트너스</h4>
							<h5 className="product__name">Light Two Tuck Wide Jeans (L.Blue)</h5>

							<div className="product__price">
								<div aria-live="polite">
									<span className="summary__badge text-red-500 mr-1">22%</span>
									<span className="summary__price">145,040원</span>
								</div>
							</div>
							<div className="product__meta">
								<div className="meta__wish">
									<span className="meta__icon">
										<FaHeart />
									</span>
									<span className="meta__count">2.0만</span>
								</div>

								<div className="meta__rate">
									<span className="meta__icon">
										<FaStar />
									</span>
									<span className="meta__count">4.9(6천+)</span>
								</div>
							</div>
						</div>
					</div>
					<div className="wish__item">
						{/* 이미지 */}
						<div className="product__thumb">
							<Image src={"https://ehfqntuqntu.cdn1.cafe24.com/main/4.jpg"} alt="" fill className="product__img" />
							<div className="product__wish-btn">
								<FaHeart />
							</div>
						</div>
						{/* 하단 상품설명 */}
						<div className="product__info">
							<h4 className="product__brand">포트너스</h4>
							<h5 className="product__name">Light Two Tuck Wide Jeans (L.Blue)</h5>

							<div className="product__price">
								<div aria-live="polite">
									<span className="summary__badge text-red-500 mr-1">22%</span>
									<span className="summary__price">145,040원</span>
								</div>
							</div>
							<div className="product__meta">
								<div className="meta__wish">
									<span className="meta__icon">
										<FaHeart />
									</span>
									<span className="meta__count">2.0만</span>
								</div>

								<div className="meta__rate">
									<span className="meta__icon">
										<FaStar />
									</span>
									<span className="meta__count">4.9(6천+)</span>
								</div>
							</div>
						</div>
					</div>
					<div className="wish__item">
						{/* 이미지 */}
						<div className="product__thumb">
							<Image src={"https://ehfqntuqntu.cdn1.cafe24.com/main/4.jpg"} alt="" fill className="product__img" />
							<div className="product__wish-btn">
								<FaHeart />
							</div>
						</div>
						{/* 하단 상품설명 */}
						<div className="product__info">
							<h4 className="product__brand">포트너스</h4>
							<h5 className="product__name">Light Two Tuck Wide Jeans (L.Blue)</h5>

							<div className="product__price">
								<div aria-live="polite">
									<span className="summary__badge text-red-500 mr-1">22%</span>
									<span className="summary__price">145,040원</span>
								</div>
							</div>
							<div className="product__meta">
								<div className="meta__wish">
									<span className="meta__icon">
										<FaHeart />
									</span>
									<span className="meta__count">2.0만</span>
								</div>

								<div className="meta__rate">
									<span className="meta__icon">
										<FaStar />
									</span>
									<span className="meta__count">4.9(6천+)</span>
								</div>
							</div>
						</div>
					</div>
					<div className="wish__item">
						{/* 이미지 */}
						<div className="product__thumb">
							<Image src={"https://ehfqntuqntu.cdn1.cafe24.com/main/4.jpg"} alt="" fill className="product__img" />
							<div className="product__wish-btn">
								<FaHeart />
							</div>
						</div>
						{/* 하단 상품설명 */}
						<div className="product__info">
							<h4 className="product__brand">포트너스</h4>
							<h5 className="product__name">Light Two Tuck Wide Jeans (L.Blue)</h5>

							<div className="product__price">
								<div aria-live="polite">
									<span className="summary__badge text-red-500 mr-1">22%</span>
									<span className="summary__price">145,040원</span>
								</div>
							</div>
							<div className="product__meta">
								<div className="meta__wish">
									<span className="meta__icon">
										<FaHeart />
									</span>
									<span className="meta__count">2.0만</span>
								</div>

								<div className="meta__rate">
									<span className="meta__icon">
										<FaStar />
									</span>
									<span className="meta__count">4.9(6천+)</span>
								</div>
							</div>
						</div>
					</div>
					<div className="wish__item">
						{/* 이미지 */}
						<div className="product__thumb">
							<Image src={"https://ehfqntuqntu.cdn1.cafe24.com/main/4.jpg"} alt="" fill className="product__img" />
							<div className="product__wish-btn">
								<FaHeart />
							</div>
						</div>
						{/* 하단 상품설명 */}
						<div className="product__info">
							<h4 className="product__brand">포트너스</h4>
							<h5 className="product__name">Light Two Tuck Wide Jeans (L.Blue)</h5>

							<div className="product__price">
								<div aria-live="polite">
									<span className="summary__badge text-red-500 mr-1">22%</span>
									<span className="summary__price">145,040원</span>
								</div>
							</div>
							<div className="product__meta">
								<div className="meta__wish">
									<span className="meta__icon">
										<FaHeart />
									</span>
									<span className="meta__count">2.0만</span>
								</div>

								<div className="meta__rate">
									<span className="meta__icon">
										<FaStar />
									</span>
									<span className="meta__count">4.9(6천+)</span>
								</div>
							</div>
						</div>
					</div>
					<div className="wish__item">
						{/* 이미지 */}
						<div className="product__thumb">
							<Image src={"https://ehfqntuqntu.cdn1.cafe24.com/main/4.jpg"} alt="" fill className="product__img" />
							<div className="product__wish-btn">
								<FaHeart />
							</div>
						</div>
						{/* 하단 상품설명 */}
						<div className="product__info">
							<h4 className="product__brand">포트너스</h4>
							<h5 className="product__name">Light Two Tuck Wide Jeans (L.Blue)</h5>

							<div className="product__price">
								<div aria-live="polite">
									<span className="summary__badge text-red-500 mr-1">22%</span>
									<span className="summary__price">145,040원</span>
								</div>
							</div>
							<div className="product__meta">
								<div className="meta__wish">
									<span className="meta__icon">
										<FaHeart />
									</span>
									<span className="meta__count">2.0만</span>
								</div>

								<div className="meta__rate">
									<span className="meta__icon">
										<FaStar />
									</span>
									<span className="meta__count">4.9(6천+)</span>
								</div>
							</div>
						</div>
					</div>
					<div className="wish__item">
						{/* 이미지 */}
						<div className="product__thumb">
							<Image src={"https://ehfqntuqntu.cdn1.cafe24.com/main/4.jpg"} alt="" fill className="product__img" />
							<div className="product__wish-btn">
								<FaHeart />
							</div>
						</div>
						{/* 하단 상품설명 */}
						<div className="product__info">
							<h4 className="product__brand">포트너스</h4>
							<h5 className="product__name">Light Two Tuck Wide Jeans (L.Blue)</h5>

							<div className="product__price">
								<div aria-live="polite">
									<span className="summary__badge text-red-500 mr-1">22%</span>
									<span className="summary__price">145,040원</span>
								</div>
							</div>
							<div className="product__meta">
								<div className="meta__wish">
									<span className="meta__icon">
										<FaHeart />
									</span>
									<span className="meta__count">2.0만</span>
								</div>

								<div className="meta__rate">
									<span className="meta__icon">
										<FaStar />
									</span>
									<span className="meta__count">4.9(6천+)</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
