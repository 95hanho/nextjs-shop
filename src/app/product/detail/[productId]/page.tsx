import { FaHeart } from "react-icons/fa";
import { GoArrowRight } from "react-icons/go";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import ProductVisualInfo from "./ProductVisualInfo";
import ProductDescription from "./ProductDescription";
import TestImage from "@/components/test/TestImage";
import ProductBlog from "./ProductBlog";
import { FiHeart } from "react-icons/fi";
import ImageFill from "@/components/common/ImageFill";
import { BsChevronRight } from "react-icons/bs";
import ImageSlide from "@/components/product/ImageSlide";
import { Product } from "@/types/product";
import Link from "next/link";
import { money } from "@/lib/format";
import BrandOtherProducts from "./BrandOtherProducts";
import BestRankProducts from "./BestRankProducts";
import ProductReview from "./ProductReview";
import QuestionAnswer from "./QuestionAnswer";

export default function ProductDetail({
	params: { productId },
}: {
	params: {
		productId: string;
	};
}) {
	console.log(productId);

	return (
		<main id="productDetail">
			{/* 상품 사진 및 가격배송 정보 */}
			<ProductVisualInfo />
			{/* 업체등록 상품 상세 블로그 */}
			<section id="product-description">
				<ProductDescription />
				{/* 광고이미지 */}
				<div className="advertisement-image">
					<img src="" alt="광고 이미지" />
				</div>
				{/* 등록된 상품정보이미지 */}
				<ProductBlog />
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
							<ImageFill />
							<button className="brand-like">
								<div>
									<FiHeart />
								</div>
								<p>93474</p>
							</button>
							<a className="brand-home-link" href="">
								<span className="brand-home-link-title">Brand Home</span>
								<span className="brand-home-link-arrow">
									<BsChevronRight />
								</span>
							</a>
						</div>
					</div>
					<div className="brand-other-products">
						<h3>판매자 다른 상품</h3>
						<div className="image-slide">
							{/* 슬라이드 */}
							<BrandOtherProducts />
						</div>
					</div>
				</article>
			</section>
			<ProductReview />
			<QuestionAnswer />
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
						<button className="on">실시간</button>
						<button>일간</button>
						<button>주간</button>
						<button>월간</button>
					</div>
					{/* 슬라이드 */}
					<div className="image-slide">
						{/* 슬라이드 벨트 */}
						<BestRankProducts />
					</div>
				</div>
			</section>
		</main>
	);
}
