import { ReviewStar } from "@/components/product/ReviewStar";
import { OptionSelector } from "@/components/ui/OptionSelector";
import Link from "next/link";
import { FaHeart } from "react-icons/fa";
import { GoQuestion } from "react-icons/go";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import styles from "../ProductDetail.module.scss";
import { SmartImage } from "@/components/common/SmartImage";
import { calculateMileage, discountPercent, money } from "@/lib/format";
import { ProductOption } from "@/types/product";
import { useMemo, useState } from "react";
import { GetProductDetailCouponResponse } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { getNormal } from "@/api/fetchFilter";
import API_URL from "@/api/endpoints";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useAuth } from "@/hooks/useAuth";
import moment from "moment";

interface ProductVisualInfoProps {
	productId: number;
	productDetail: {
		name: string;
		originPrice: number;
		finalPrice: number;
		baseShippingFee: number; // 기본 배송비
		freeShippingMinAmount: number; // 무료배송 최소 주문금액
		extraShippingFee: number; // 제주/도서산간 추가 배송비
		shippingType: "IMMEDIATE" | "RESERVED"; // 출고 방식('IMMEDIATE','RESERVED')
		shippingDueDate: string; // 출고 예정일
		shippingNote: string; // 출고 관련 추가 안내 문구
	};
	reviewCount: number;
	reviewRate: number;
	productOptionList: ProductOption[];
}

// 상품 사진 및 가격배송 정보
export default function ProductVisualInfo({ productId, productDetail, reviewCount, reviewRate, productOptionList }: ProductVisualInfoProps) {
	const { loginOn } = useAuth();

	/* ----- Query ------------------------------------------------------ */

	// 이용가능쿠폰 조회
	const {
		data: availableCouponResponse,
		isSuccess,
		isError,
		isFetching,
	} = useQuery<GetProductDetailCouponResponse>({
		queryKey: ["productReviewList", productId],
		queryFn: () => getNormal(getApiUrl(API_URL.PRODUCT_DETAIL_COUPON), { productId }),
		enabled: loginOn,
		refetchOnWindowFocus: false,
		select(data) {
			console.log({ availableCouponResponse: data });
			return data;
		},
	});

	/* ------------------------------------------------------------------ */

	// 제품 옵션 선택index
	const [pickIdx, setPickIdx] = useState(0);
	// 제품 옵션 들어갈 꺼
	const { optionInitData, optionSelectList } = useMemo(() => {
		const first = productOptionList[0];
		return {
			optionInitData: {
				id: first.productOptionId,
				val: first.size + (first.addPrice > 0 ? `(+ ${money(first.addPrice)})` : ""),
			},
			optionSelectList: productOptionList.map((v) => ({
				id: v.productOptionId,
				val: v.size + (v.addPrice > 0 ? `(+ ${money(v.addPrice)})` : ""),
			})),
		};
	}, [productOptionList]);

	return (
		<section className={styles.productVisualInfo}>
			<div className={styles.productImageArea}>
				<SmartImage width={900} height={900} objectFit="contain" />
			</div>

			<div className={styles.productTextInfo}>
				<div className={styles.productMetaInfo}>
					<div className={styles.productTitleWishlist}>
						<div className={styles.productName}>{productDetail.name}</div>
						<button className={styles.productWishlist}>
							<FaHeart />
						</button>
					</div>

					<div className={styles.productReviewSection}>
						<ReviewStar rate={reviewRate} size={15} />
						<Link href="">{reviewCount}개 리뷰보기</Link>
					</div>

					<div className={styles.productPriceInfo}>
						{/* 상품 자체 할인가격 */}
						{productDetail.originPrice !== productDetail.finalPrice && (
							<h6 className={styles.originalPrice}>{money(productDetail.originPrice)}원</h6>
						)}
						{/* <p className={styles.firstPurchaseLabel}>첫 구매가</p> */}
						<div className={styles.priceDiscount}>
							<div className={styles.priceBox}>
								{productDetail.originPrice !== productDetail.finalPrice && (
									<b>{discountPercent(productDetail.originPrice, productDetail.finalPrice)}%</b>
								)}
								<strong>{money(productDetail.finalPrice)}원</strong>
							</div>

							<button className={styles.tooltipBtn}>
								<GoQuestion />
							</button>
						</div>
						{/* 쿠폰 적용가 */}
						<div className={styles.myPrice}>
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

				<div className={styles.productAdditionalInfo}>
					<div className={styles.productMileage}>
						<b>구매 적립금</b>
						<span>최대 {calculateMileage(productDetail.finalPrice)} 마일리지 적립 예정</span>
					</div>

					<div className={styles.installmentInfo}>
						<b>무이자 할부</b>
						<div>
							<p>최대 7개월 무이자 할부 시 월 8,285원 결제</p>
							<div>
								<button>카드사별 할부 혜택 안내</button>
							</div>
						</div>
					</div>

					<div className={styles.deliveryInfo}>
						<b>
							배송정보
							<button>
								<GoQuestion />
							</button>
						</b>
						<span>
							{productDetail.shippingType === "IMMEDIATE" && "즉시 출고"}
							{productDetail.shippingType === "RESERVED" && "예약 출고"}
							{productDetail.shippingDueDate && <span>{moment(productDetail.shippingDueDate).format("YYYY.MM.DD")} 이내 출고</span>}
							{productDetail.shippingNote && (
								<>
									<br />
									<mark>{productDetail.shippingNote}</mark>
								</>
							)}
						</span>
					</div>

					<div className={styles.deliveryFeeInfo}>
						<b>배송비</b>
						<div>
							<p>{productDetail.baseShippingFee === 0 ? `무료 배송` : `${money(productDetail.baseShippingFee)}원`}</p>
							{productDetail.baseShippingFee > 0 && <p>{money(productDetail.freeShippingMinAmount)}원 이상 구매시 무료배송</p>}
							{productDetail.extraShippingFee && <p>제주/도서산간 {money(productDetail.extraShippingFee)}원 추가</p>}
						</div>
					</div>
				</div>

				<div className={styles.productOptionBuy}>
					<div className={styles.productOptionSelect}>
						<OptionSelector
							optionSelectorName="productVisualOption"
							pickIdx={pickIdx}
							initData={optionInitData}
							optionList={optionSelectList}
							changeOption={(idx) => {
								setPickIdx(idx);
							}}
						/>
					</div>

					<div className={styles.actionButtons}>
						<button className={styles.btnCart}>장바구니 담기</button>
						<button className={styles.btnBuy}>바로 구매하기</button>
					</div>
				</div>
			</div>
		</section>
	);
}
