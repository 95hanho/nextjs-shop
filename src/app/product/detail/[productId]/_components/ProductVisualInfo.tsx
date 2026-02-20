import { ReviewStar } from "@/components/product/ReviewStar";
import { OptionSelector } from "@/components/ui/OptionSelector";
import Link from "next/link";
import { FaHeart } from "react-icons/fa";
import { GoQuestion } from "react-icons/go";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import styles from "../ProductDetail.module.scss";
import { SmartImage } from "@/components/ui/SmartImage";
import { discountPercent, money } from "@/lib/format";
import { ProductOption } from "@/types/product";
import { useEffect, useMemo, useState } from "react";
import { GetProductDetailCouponResponse } from "@/types/product";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getNormal } from "@/api/fetchFilter";
import API_URL from "@/api/endpoints";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useAuth } from "@/hooks/useAuth";
import moment from "moment";
import MyPriceCheckboxTooltip from "@/app/product/detail/[productId]/_components/MyPriceCheckboxTooltip";
import { useRouter } from "next/navigation";
import { calculateDiscount, calculateMileage } from "@/lib/price";

export type AppliedCoupon = {
	couponId: number;
	discountAmount: number;
};

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
			return data;
		},
	});

	/* ------------------------------------------------------------------ */

	// 나의 가격 구매 가능 가격
	const [totalPrice, setTotalPrice] = useState(productDetail.finalPrice);
	// 나의 가격 상세 보기 토글
	const [showMyPriceDetail, setShowMyPriceDetail] = useState(true);
	// 적용된 쿠폰
	const [appliedProductCoupon, setAppliedProductCoupon] = useState<{
		unStackable: AppliedCoupon | null;
		stackable: AppliedCoupon[];
	}>({
		unStackable: null,
		stackable: [],
	});
	const getAppliedCoupon = (coupon: GetProductDetailCouponResponse["availableProductCoupon"][number]): AppliedCoupon => {
		return {
			couponId: coupon.couponId,
			discountAmount: calculateDiscount(productDetail.finalPrice, coupon) || 0,
		};
	};
	// 적립금 사용 여부
	const [mileageUsed, setMileageUsed] = useState(false);
	// 사용한 적립금
	const [useMileage, setUseMileage] = useState(0);

	useEffect(() => {
		let totalPrice = productDetail.finalPrice;
		if (appliedProductCoupon.unStackable) {
			totalPrice -= appliedProductCoupon.unStackable.discountAmount;
		}
		if (appliedProductCoupon.stackable.length > 0) {
			appliedProductCoupon.stackable.forEach((coupon) => {
				totalPrice -= coupon.discountAmount;
			});
		}
		if (mileageUsed) {
			totalPrice = Math.max(0, totalPrice - user.mileage);
			setUseMileage(Math.max(user.mileage, user.mileage - totalPrice));
		}

		setTotalPrice(totalPrice);
	}, [appliedProductCoupon, mileageUsed, productDetail, user]);

	// 제품 옵션 들어갈 꺼
	const { optionInitData, optionSelectList } = useMemo(() => {
		const optionInitData = {
			id: 0,
			val: "사이즈",
		};
		const optionSelectList = [];
		optionSelectList.push(optionInitData);
		optionSelectList.push(
			...productOptionList.map((v) => ({
				id: v.productOptionId,
				val: v.size + (v.addPrice > 0 ? `(+ ${money(v.addPrice)})` : ""),
			})),
		);
		return {
			optionInitData,
			optionSelectList,
		};
	}, [productOptionList]);
	// 쿠폰 리스트에서 상품쿠폰과 장바구니 쿠폰 분류
	const { productCoupon, cartCoupon } = useMemo(() => {
		if (!availableCouponResponse) return { productCoupon: [], cartCoupon: [] };
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
						<div className={styles.myPrice}>
							<div className={styles.myPriceToggle}>
								<div>
									<b>{discountPercent(productDetail.originPrice, totalPrice)}%</b>
									<strong>{money(totalPrice)}원</strong>
								</div>
								<button onClick={() => setShowMyPriceDetail(!showMyPriceDetail)}>
									나의 구매 가능 가격
									{!showMyPriceDetail ? <IoIosArrowDown /> : <IoIosArrowUp />}
								</button>
							</div>
							{showMyPriceDetail && (
								<>
									{productCoupon.length > 0 && cartCoupon.length > 0 ? (
										<div className={styles.myPriceDetails}>
											{productDetail.originPrice !== productDetail.finalPrice && (
												<div>
													<h4>상품 할인</h4>
													<MyPriceCheckboxTooltip type="BASE" {...myPriceCheckboxCommonProps} />
												</div>
											)}
											<div>
												<h4>상품 쿠폰 할인</h4>
												{productCoupon.map((coupon) => {
													return (
														<MyPriceCheckboxTooltip
															type="COUPON"
															key={coupon.couponId}
															{...myPriceCheckboxCommonProps}
															coupon={coupon}
															couponChecked={
																(coupon.isStackable
																	? appliedProductCoupon.stackable.some((c) => c.couponId === coupon.couponId)
																	: appliedProductCoupon.unStackable?.couponId === coupon.couponId) || false
															}
															setAppliedProductCoupon={(isAdd) => {
																if (!coupon.isStackable) {
																	setAppliedProductCoupon((prev) => ({
																		...prev,
																		unStackable: isAdd ? getAppliedCoupon(coupon) : null,
																	}));
																} else {
																	setAppliedProductCoupon((prev) => ({
																		...prev,
																		stackable: isAdd
																			? [...prev.stackable, getAppliedCoupon(coupon)]
																			: prev.stackable.filter((c) => c.couponId !== coupon.couponId),
																	}));
																}
															}}
														/>
													);
												})}
											</div>
											<div>
												<h4>장바구니 쿠폰 할인</h4>
												{cartCoupon.map((coupon) => (
													<MyPriceCheckboxTooltip
														type="COUPON"
														key={coupon.couponId}
														{...myPriceCheckboxCommonProps}
														coupon={coupon}
														couponChecked={
															(coupon.isStackable
																? appliedProductCoupon.stackable.some((c) => c.couponId === coupon.couponId)
																: appliedProductCoupon.unStackable?.couponId === coupon.couponId) || false
														}
														setAppliedProductCoupon={(isAdd) => {
															if (!coupon.isStackable) {
																setAppliedProductCoupon((prev) => ({
																	...prev,
																	unStackable: isAdd ? getAppliedCoupon(coupon) : null,
																}));
															} else {
																setAppliedProductCoupon((prev) => ({
																	...prev,
																	stackable: isAdd
																		? [...prev.stackable, getAppliedCoupon(coupon)]
																		: prev.stackable.filter((c) => c.couponId !== coupon.couponId),
																}));
															}
														}}
													/>
												))}
											</div>
											<div>
												<h4>적립금 사용</h4>
												<MyPriceCheckboxTooltip
													type="MILEAGE"
													mileage={user.mileage}
													{...myPriceCheckboxCommonProps}
													setMileageUse={() => {
														setMileageUsed(!mileageUsed);
													}}
													couponChecked={mileageUsed}
													useMileage={useMileage}
												/>
											</div>
											<div>
												<p>
													결제수단 할인과 보유 적립금 할인, 적립 혜택을 선택하면
													<br />
													다른 상품 화면의 &apos;나의 구매 가능 가격&apos;에도 기본 적용됩니다.
												</p>
											</div>
										</div>
									) : (
										<p className="px-4 py-3 text-sm">나의 구매 가능 가격 계산중...</p>
									)}
								</>
							)}
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
							{productDetail.freeShippingMinAmount < productDetail.finalPrice || productDetail.baseShippingFee === 0 ? (
								<p>무료 배송</p>
							) : (
								<>
									<p>{money(productDetail.baseShippingFee)}원</p>
									{productDetail.baseShippingFee > 0 && <p>{money(productDetail.freeShippingMinAmount)}원 이상 구매시 무료배송</p>}
									{productDetail.extraShippingFee && <p>제주/도서산간 {money(productDetail.extraShippingFee)}원 추가</p>}
								</>
							)}
						</div>
					</div>
				</div>

				<div className={styles.productOptionBuy}>
					<div className={styles.productOptionSelect}>
						<OptionSelector
							optionSelectorName="productVisualOption"
							pickIdx={0}
							initData={optionInitData}
							optionList={optionSelectList}
							changeOption={() => {}}
							inputColor="rgb(75 70 70)"
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
