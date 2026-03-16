import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import styles from "./CartClient.module.scss";
import { useState } from "react";
import { SmartImage } from "@/components/ui/SmartImage";
import { discountPercent, money } from "@/lib/format";
import { calculateMileage } from "@/lib/price";
import clsx from "clsx";
import { useMutation } from "@tanstack/react-query";
import { BaseResponse } from "@/types/common";
import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import { BuyHoldRequest, BuyItem } from "@/types/buy";
import { useModalStore } from "@/store/modal.store";
import { useRouter } from "next/navigation";

interface CartSummaryAsideProps {
	cartOriginPrice: number; // 장바구니 제품 원래 가격 총합
	cartTotalPrice: number; // 장바구니 최종 가격
	cartSelfDiscount: number; // 장바구니 제품 자체 할인 금액
	cartCouponDiscount: number; // 장바구니 쿠폰의 할인가
	sellerCouponDiscount: number; // 판매자 쿠폰의 할인가
	deliveryFee: number; // 배송비
	//
	selectedCount: number;
	//
	buyList: BuyItem[];
}

// 우측: 요약/혜택/유의사항/CTA
export default function CartSummaryAside({
	cartOriginPrice,
	cartTotalPrice,
	cartSelfDiscount,
	cartCouponDiscount,
	sellerCouponDiscount,
	deliveryFee,
	//
	selectedCount,
	//
	buyList,
}: CartSummaryAsideProps) {
	const { openModal } = useModalStore();
	const { push } = useRouter();

	// =================================================================
	// React Query
	// =================================================================

	// 상품 확인 및 점유(구매페이지에서는 다운로드 쿠폰만 조회하기)
	const handleStockHold = useMutation<BaseResponse, Error>({
		mutationFn: () =>
			postJson<BaseResponse & { holds: number[] }, BuyHoldRequest>(getApiUrl(API_URL.BUY_HOLD), {
				buyList,
				returnUrl: "/mypage/cart",
			}),
		// Mutation이 시작되기 직전에 특정 작업을 수행
		// onMutate(variables) {
		// 	console.log(variables);
		// },
		onSuccess() {
			// console.log(data, variables, context);
			push("/buy");
		},
		onError(err, variables, context) {
			console.log(err, variables, context);
		},
		// 결과에 관계 없이 무언가 실행됨
		// onSettled(data, error, variables, context) {},
	});

	// =================================================================
	// React
	// =================================================================

	// 유의사항 on/off
	const [noticeOpen, setNoticeOpen] = useState(false);

	// 상품 구매하기 버튼 - 상품 확인 및 점유 -> 성공 시 결제 페이지로 이동, 실패 시 에러 메시지 노출
	const handlePurchaseClick = () => {
		if (buyList.length === 0) {
			openModal("ALERT", {
				content: "선택된 상품이 없습니다.",
			});
			return;
		}
		// console.log("buyList", buyList);
		handleStockHold.mutate();
	};

	return (
		<aside className={styles.priceWrap} aria-label="주문 요약">
			<div className={`${styles.priceOutline} ${styles.summaryCard}`}>
				<div className={`${styles.priceCount} ${styles.summaryCardSection}`}>
					<div className={`${styles.title} ${styles.summaryCardTitle}`}>구매금액</div>

					<div className={styles.priceLine}>
						<div className={styles.infoName}>상품 금액</div>
						<div className={styles.priceNum} data-field="subtotal">
							{money(cartOriginPrice)}원
						</div>
					</div>

					<div>
						<div className={styles.discountLine}>
							<div>총 할인 금액</div>
							<div className="font-bold text-red-500">-{money(cartOriginPrice - cartTotalPrice)}원</div>
						</div>

						<div className={clsx(styles.discountLine, styles.discountRow)}>
							<div>ㄴ 상품 자체 할인금액</div>
							<div className="text-gray-600">-{money(cartSelfDiscount)}원</div>
						</div>

						<div className={clsx(styles.discountLine, styles.discountRow)}>
							<div>ㄴ 제품 할인 쿠폰금액</div>
							<div className="text-gray-600">-{money(sellerCouponDiscount)}원</div>
						</div>

						<div className={clsx(styles.discountLine, styles.discountRow)}>
							<div>ㄴ 장바구니 쿠폰 할인금액</div>
							<div className="text-gray-600">-{money(cartCouponDiscount)}원</div>
						</div>
					</div>

					<div className={`mt-4 font-bold ${styles.priceLine} ${styles.priceLineTotal}`}>
						<div>총 구매 금액</div>
						<div aria-live="polite">
							<span className="mr-2 text-red-500 align-baseline summary__badge">
								{discountPercent(cartOriginPrice, cartTotalPrice)}%
							</span>
							<span className="align-baseline" data-field="total">
								{money(cartTotalPrice)}원
							</span>
						</div>
					</div>

					<div className={styles.priceLine}>
						<div>배송비</div>
						<div className="text-blue-700">{deliveryFee === 0 ? "무료배송" : `${money(deliveryFee)}원`}</div>
					</div>

					<div className={styles.priceLine}>
						<div>적립혜택 예상</div>
						<div>최대 {money(calculateMileage(cartTotalPrice))}원</div>
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
				<button className="w-full px-5 py-3 mt-3 text-base btn--black" onClick={handlePurchaseClick}>
					{money(cartTotalPrice + deliveryFee)}원 구매하기 ({selectedCount}개)
				</button>
			</div>
		</aside>
	);
}
