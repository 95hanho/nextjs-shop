import ReviewStar from "@/components/product/ReviewStar";
import TestImage from "@/components/test/TestImage";
import Link from "next/link";
import { FaHeart } from "react-icons/fa";
import { GoArrowRight, GoQuestion } from "react-icons/go";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";

export default function ProductDetail({
	params: { product_id },
}: {
	params: {
		product_id: string;
	};
}) {
	console.log(product_id);
	return (
		<main id="productDetail">
			{/* 상품 사진 및 가격배송 정보 */}
			<section id="product-visual-info">
				<div className="product-image-area">
					<TestImage />
				</div>
				<div className="product-text-info">
					<div className="product-meta-info">
						<div className="product-title-wishlist">
							<div className="product-name">Crown Raive Graphic T-shirt VW5ME601_3color</div>
							<div className="product-wishlist">
								<FaHeart />
							</div>
						</div>
						<div className="product-review-section">
							<ReviewStar />
							<Link href="">274개 리뷰보기</Link>
						</div>
						<div className="product-price-info">
							<h6 className="original-price">58,000원</h6>
							<p className="first-purchase-label">첫 구매가</p>
							<div className="price-discount">
								<div className="price-box">
									<b>10%</b>
									<strong>52,200원</strong>
								</div>
								<button className="tooltip-btn">
									<GoQuestion />
								</button>
							</div>
							<div className="my-price">
								<div>
									<b>10%</b>
									<strong>52,200원</strong>
								</div>
								<button>
									나의 구매 가능 가격
									{true ? <IoIosArrowDown /> : <IoIosArrowUp />}
								</button>
							</div>
						</div>
					</div>
					<div className="product-additional-info">
						<div className="product-mileage">
							<b>구매 적립금</b>
							<span>최대 580 마일리지 적립 예정</span>
						</div>
						<div className="installment-info">
							<b>무이자 할부</b>
							<div>
								<p>최대 7개월 무이자 할부 시 월 8,285원 결제</p>
								<div>
									<button>카드사별 할부 혜택 안내</button>
								</div>
							</div>
						</div>
						<div className="delivery-info">
							<b>
								배송정보
								<button>
									<GoQuestion />
								</button>
							</b>
							<span>
								예약 출고 <span>2025.05.30 이내 출고</span>
							</span>
						</div>
						<div className="delivery-fee-info">
							<b>배송비</b>
							<div>
								<p>2,500원</p>
								<p>30,000원 이상 구매시 무료배송</p>
								<p>제주/도서산간 3,000원 추가</p>
							</div>
						</div>
					</div>
					<div className="product-option-buy">
						<div className="option-selector">
							<div className="option-select-box">
								<input type="text" value={"COLOR:SIZE"} readOnly />
								<span>{true ? <IoIosArrowDown /> : <IoIosArrowUp />}</span>
							</div>

							<ul className="option-list">
								<li>COLOR:SIZE</li>
								<li>WHITE:0S</li>
								<li>WHITE:01S</li>
							</ul>
						</div>
						<div className="action-buttons">
							<button className="btn-cart">장바구니 담기</button>
							<button className="btn-buy">바로 구매하기</button>
						</div>
					</div>
				</div>
			</section>
			{/* 업체등록 상품 상세 블로그 */}
			<section id="product-description">
				<article className="description-toggle">
					<button>
						<h2>상품정보</h2>
						<span>{true ? <IoIosArrowDown /> : <IoIosArrowUp />}</span>
					</button>
					<h3 className="product-number">상품번호 : 3167608</h3>
				</article>
				{/* 광고이미지 */}
				<div className="advertisement-image">
					<img src="" alt="" />
				</div>
				{/* 등록된 상품정보이미지 */}
				<article className="product-detail-images">
					<h2>상품 설명</h2>
					{[...Array(5)].map((_, i) => (
						<div key={i}>
							<img src="" alt="" />
						</div>
					))}
				</article>
				<div className="description-more-btn">
					<button>
						상품 설명 {true ? "더보기" : "닫기"}
						<span>{true ? <IoIosArrowDown /> : <IoIosArrowUp />}</span>
					</button>
				</div>
			</section>
			{/* 상품정보 보기, 판매자 정보 */}
			<section id="product-info-section">
				<article className="product-spec-table">
					<h2>상품정보보기</h2>
					<table>
						<tbody>
							<tr>
								<th>제품 소재</th>
								<td>겉감:면100%</td>
							</tr>
							<tr>
								<th>색상</th>
								<td>상세페이지 참조</td>
							</tr>
							<tr>
								<th>치수</th>
								<td>상세페이지 참조</td>
							</tr>
							<tr>
								<th>제조자</th>
								<td>㈜이터널그룹</td>
							</tr>
							<tr>
								<th>제조국</th>
								<td>대한민국</td>
							</tr>
							<tr>
								<th>세탁방법 및 취급시 주의사항</th>
								<td>상세페이지 참조 (케어라벨 참조)</td>
							</tr>
							<tr>
								<th>제조연월</th>
								<td>202503</td>
							</tr>
							<tr>
								<th>품질보증기준</th>
								<td>관련법 및 소비자분쟁해결 규정에 따름</td>
							</tr>
							<tr>
								<th>A/S 책임자와 전화번호</th>
								<td>(주)이터널그룹/080-202-2023</td>
							</tr>
						</tbody>
					</table>
				</article>
				<article className="seller-info-section">
					<h2>판매자정보</h2>
					<table>
						<tbody>
							<tr>
								<th>주식회사</th>
								<td>이터널그룹</td>
							</tr>
							<tr>
								<th>사업자등록번호</th>
								<td>7778601189</td>
							</tr>
							<tr>
								<th>통신판매업번호</th>
								<td>2021-서울성동-00392</td>
							</tr>
							<tr>
								<th>대표자</th>
								<td>민경준</td>
							</tr>
							<tr>
								<th>사업장 소재지</th>
								<td>(04799) 서울특별시 성동구 성수동2가 280-6 생각공장데시앙플렉스 1903,1905,1907,2004,2008호</td>
							</tr>
						</tbody>
					</table>
					<div className="related-brand-products">
						<div className="brand-thumbnail">
							<img src="" alt="" />
						</div>
						<a className="brand-home-link" href="">
							Brand Home
							<GoArrowRight />
						</a>
						<div className="brand-other-products">
							<h2>해당 브랜드 다른 옷</h2>
							{/* 슬라이드 */}
							<div className="product-slider">
								{/* 슬라이드 벨트 */}
								<div className="slider-belt">
									{/* 슬라이드 요소 */}
									<div className="slider-item">
										{/* 전체 링크 */}
										<a href=""></a>
										{/* 이미지 */}
										<div className="image-box">
											<img src="" alt="" />
											<button>
												<FaHeart />
											</button>
										</div>
										<p>Waist String Wide Pants VW5ML470_3color</p>
										<h4>
											<b>10%</b>128,000
										</h4>
									</div>
								</div>
								<div className="slider-pagination">
									<RiArrowRightSLine /> 3 / 4 <RiArrowLeftSLine />
								</div>
							</div>
						</div>
					</div>
				</article>
			</section>
			{/* <Review /> */}
			{/* <QuestionAnswer /> */}
			{/* 배송정보, 교환, 환불, A/S안내, 같은 카테고리 추천 */}
			<section id="etc-info-section">
				<div className="shipping-guide">
					<h2>배송정보</h2>
					<p>브랜드 업체발송은 상품설명에 별도로 기입된 브랜드 알림 배송공지 기준으로 출고되고 브랜드마다 개별 배송비가 부여됩니다.</p>
					<p>
						29CM 자체발송은 오후 2시까지 결제확인된 주문은 당일 출고되고 5만원 이상 주문은 무료배송, 5만원 미만은 3,000원의 배송비가
						추가됩니다.
					</p>
					<p>SPECIAL ORDER, PT 등 예약주문은 상세설명의 출고일정을 확인하시기 바랍니다.</p>
					<p>구두, 액세서리, 침구, 액자, 가구 등 상품설명의 제작기간을 숙지해주시기 바랍니다.</p>
					<p>가구 및 일부 상품, 제주도를 포함한 도서산간 지역은 추가배송비 입금요청이 있을 수 있습니다.</p>
				</div>
				<div className="refund-guide">
					<h2>교환, 환불, A/S 안내</h2>
					<p>상품 수령일로부터 7일 이내 반품 / 환불 가능합니다.</p>
					<p>변심 반품의 경우 왕복배송비를 차감한 금액이 환불되며, 제품 및 포장 상태가 재판매 가능하여야 합니다.</p>
					<p>동일상품 또는 동일상품 내 추가금액이 없는 옵션만 교환가능합니다.</p>
					<p>상품 불량인 경우는 배송비를 포함한 전액이 환불됩니다.</p>
					<p>출고 이후 환불요청 시 상품 회수 후 처리됩니다.</p>
					<p>얼리 등 주문제작상품 / 카메라 / 밀봉포장상품 등은 변심에 따른 반품 / 환불이 불가합니다.</p>
					<p>일부 완제품으로 수입된 상품의 경우 A/S가 불가합니다.</p>
					<p>특정브랜드의 상품설명에 별도로 기입된 교환 / 환불 / AS 기준이 우선합니다.</p>
					<p>
						구매자가 미성년자인 경우에는 상품 구입 시 법정대리인이 동의하지 아니하면 미성년자 본인 또는 법정대리인이 구매취소 할 수
						있습니다.
					</p>
					<p>상품의 색상과 이미지는 기기의 해상도에 따라 다르게 보일 수 있습니다.</p>
				</div>
				<div className="best-short-sleeve-section">
					<h2>반소매 티셔츠 BEST</h2>
					<div className="rank-tabs">
						<button>실시간</button>
						<button>일간</button>
						<button>주간</button>
						<button>월간</button>
					</div>
					{/* 슬라이드 */}
					<div className="rank-slider">
						{/* 슬라이드 벨트 */}
						<div className="slider-belt">
							{/* 슬라이드요소 */}
							<div className="slider-item">
								<a href=""></a>
								<div className="image-box">
									<img src="" alt="" />
									<mark>1</mark>
									<button>
										<FaHeart />
									</button>
								</div>
								<h4>마리떼 프랑소와 저버</h4>
								<p>W CLASSIC LOGO TEE (7color)</p>
								<p>
									<b>15%</b>
									<span>41,895</span>
								</p>
							</div>
						</div>
						<div className="slider-pagination">
							<RiArrowRightSLine /> 1 / 10
							<RiArrowLeftSLine />
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
