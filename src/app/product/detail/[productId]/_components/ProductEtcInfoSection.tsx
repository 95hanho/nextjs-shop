import BestRankProducts from "@/app/product/detail/[productId]/_components/BestRankProducts";
import styles from "../ProductDetail.module.scss";

// 배송정보, 교환, 환불, A/S안내, 같은 카테고리 추천
export default function ProductEtcInfoSection() {
	return (
		<section id="etc-info-section">
			<div className={styles.shippingGuide}>
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

			<div className={styles.refundGuide}>
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
					구매자가 미성년자인 경우에는 상품 구입 시 법정대리인이 동의하지 아니하면 미성년자 본인 또는 법정대리인이 구매취소 할 수 있습니다.
				</p>
				<p>상품의 색상과 이미지는 기기의 해상도에 따라 다르게 보일 수 있습니다.</p>
			</div>

			<div className={styles.bestShortSleeveSection}>
				<h2>반소매 티셔츠 BEST</h2>

				<div className={styles.rankTabs}>
					<button className={styles.on}>실시간</button>
					<button>일간</button>
					<button>주간</button>
					<button>월간</button>
				</div>

				{/* 슬라이드 */}
				<div className={styles.imageSlide}>
					{/* 슬라이드 벨트 */}
					<BestRankProducts />
				</div>
			</div>
		</section>
	);
}
