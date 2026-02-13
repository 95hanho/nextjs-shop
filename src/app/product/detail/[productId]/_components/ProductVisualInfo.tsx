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
import { useMutation, useQuery } from "@tanstack/react-query";
import { getNormal } from "@/api/fetchFilter";
import API_URL from "@/api/endpoints";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useAuth } from "@/hooks/useAuth";
import moment from "moment";
import MyPriceCheckboxTooltip from "@/app/product/detail/[productId]/_components/MyPriceCheckboxTooltip";
import { useRouter } from "next/navigation";

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
	const { loginOn, user } = useAuth();
	const { push } = useRouter();

	/* ----- Query ------------------------------------------------------ */

	// 이용가능쿠폰 조회
	const {
		data: availableCouponResponse,
		isSuccess,
		isError,
		isFetching,
	} = useQuery<GetProductDetailCouponResponse>({
		queryKey: ["productCouponList", productId],
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
	const { productCoupon, cartCoupon } = useMemo(() => {
		const productCoupon: GetProductDetailCouponResponse["availableProductCoupon"] = [];
		const cartCoupon: GetProductDetailCouponResponse["availableProductCoupon"] = [];
		if (availableCouponResponse?.availableProductCoupon) {
			availableCouponResponse.availableProductCoupon.forEach((coupon) => {
				if (coupon.sellerName) {
					productCoupon.push(coupon);
				} else {
					cartCoupon.push(coupon);
				}
			});
		}
		console.log({ productCoupon, cartCoupon });
		return { productCoupon, cartCoupon };
	}, [availableCouponResponse]);

	/*  */

	const myPriceCheckboxCommonProps = {
		originPrice: productDetail.originPrice,
		finalPrice: productDetail.finalPrice,
		productId,
	};

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
						{availableCouponResponse && (
							<div className={styles.myPrice}>
								<div className={styles.myPriceToggle}>
									<div>
										<b>10%</b>
										<strong>52,200원</strong>
									</div>
									<button>
										나의 구매 가능 가격
										{true ? <IoIosArrowDown /> : <IoIosArrowUp />}
									</button>
								</div>
								<div className={styles.myPriceDetails}>
									{productDetail.originPrice !== productDetail.finalPrice && (
										<div>
											<h4>상품 할인</h4>
											<MyPriceCheckboxTooltip type="BASE" {...myPriceCheckboxCommonProps} />
										</div>
									)}
									<div>
										<h4>상품 쿠폰 할인</h4>
										{productCoupon.map((coupon) => (
											<MyPriceCheckboxTooltip
												type="COUPON"
												key={coupon.couponId}
												{...myPriceCheckboxCommonProps}
												coupon={coupon}
											/>
										))}
									</div>
									<div>
										<h4>장바구니 쿠폰 할인</h4>
										{cartCoupon.map((coupon) => (
											<MyPriceCheckboxTooltip
												type="COUPON"
												key={coupon.couponId}
												{...myPriceCheckboxCommonProps}
												coupon={coupon}
											/>
										))}
									</div>
									<div>
										<h4>적립금 사용</h4>
										<MyPriceCheckboxTooltip type="MILEAGE" mileage={user.mileage} {...myPriceCheckboxCommonProps} />
									</div>
									<div>
										<p>
											결제수단 할인과 보유 적립금 할인, 적립 혜택을 선택하면
											<br />
											다른 상품 화면의 &apos;나의 구매 가능 가격&apos;에도 기본 적용됩니다.
										</p>
									</div>
								</div>
							</div>
						)}
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
						<button
							className={styles.btnBuy}
							onClick={() => {
								push(`/buy`);
							}}
						>
							바로 구매하기
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
