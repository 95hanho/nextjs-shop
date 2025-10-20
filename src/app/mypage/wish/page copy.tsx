import { FaHeart, FaStar } from "react-icons/fa";

export default function Wish() {
	return (
		<main id="wish" className="like">
			<div className="like__header">
				<div className="like__title">
					<span>좋아요</span>
				</div>

				<div className="like__tabs like__tabs--category">
					<ul className="tab__list">
						<li className="tab__item on">상품 4</li>
						<li className="tab__item">브랜드 2</li>
					</ul>
				</div>

				<div className="like__tabs like__tabs--filter">
					<ul className="tab__list">
						<li className="tab__item on">전체</li>
						<li className="tab__item">신발</li>
						<li className="tab__item">바지</li>
					</ul>
				</div>
			</div>

			<div className="like__content">
				<div className="like__filters">
					<div className="onoff-btn-wrap">
						<input type="checkbox" id="sale-switch" name="sale" className="onf_checkbox" />
						<label htmlFor="sale-switch" className="switch_label">
							<span className="onf_btn"></span>
							<span className="onf_txt c_red">세일중</span>
						</label>
					</div>

					<div className="onoff-btn-wrap">
						<input type="checkbox" id="selling-switch" name="selling" className="onf_checkbox" />
						<label htmlFor="selling-switch" className="switch_label">
							<span className="onf_btn"></span>
							<span className="onf_txt c_red">판매 중 상품만 보기</span>
						</label>
					</div>
				</div>

				<div className="like__list">
					<div className="like__item">
						<div className="product__thumb">
							<img src="" alt="" className="product__img" />
							<div className="product__like-btn">
								<FaHeart />
							</div>
						</div>

						<div className="product__info">
							<h4 className="product__brand">포트너스</h4>
							<h5 className="product__name">Light Two Tuck Wide Jeans (L.Blue)</h5>

							<div className="product__price">
								<div aria-live="polite">
									<span className="summary__badge text-red-500 mr-2">22%</span>
									<span className="summary__price">145,040원</span>
								</div>
							</div>

							<div className="product__meta">
								<label className="meta__like">
									<span className="meta__icon">
										<FaHeart />
									</span>
									<span className="meta__count">2.0만</span>
								</label>

								<label className="meta__rate">
									<span className="meta__icon">
										<FaStar />
									</span>
									<span className="meta__count">4.9(6천+)</span>
								</label>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
