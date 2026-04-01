import { ReviewStar } from "@/components/product/ReviewStar";
import { OptionSelector } from "@/components/ui/OptionSelector";
import Link from "next/link";
import { FaHeart } from "react-icons/fa";
import { GoQuestion } from "react-icons/go";
import { IoIosArrowDown, IoIosArrowUp, IoIosClose } from "react-icons/io";
import styles from "../ProductDetail.module.scss";
import { SmartImage } from "@/components/ui/SmartImage";
import { discountPercent, money } from "@/lib/format";
import { AvailableCouponAtProductDetail, ProductOption } from "@/types/product";
import { useEffect, useMemo, useState } from "react";
import { GetProductDetailCouponResponse } from "@/types/product";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getNormal } from "@/api/fetchFilter";
import API_URL from "@/api/endpoints";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useAuth } from "@/hooks/useAuth";
import moment from "moment";
import MyPriceCheckboxTooltip from "@/app/product/detail/[productId]/_components/MyPriceCheckboxTooltip";
import { calculateDiscount, calculateMileage } from "@/lib/price";
import { ProductCounter } from "@/components/ui/ProductCounter";
import { GetCartOtherOptionListResponse } from "@/types/mypage";
import { useProductCartAction } from "@/hooks/query/mypage/useProductCartAction";
import { AddCartPopup } from "@/components/mypage/AddCartPopup";
import { useProductCheckAndHold } from "@/hooks/query/buy/useProductCheckAndHold";

export type ProductCouponWithDiscount = AvailableCouponAtProductDetail & {
	discountAmount: number;
};
export type GetProductDetailCouponWithDiscountData = Omit<GetProductDetailCouponResponse, "availableProductCoupon"> & {
	availableProductCoupon: ProductCouponWithDiscount[];
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
	initProductOptionList: ProductOption[];
}

// 상품 사진 및 가격배송 정보
export default function ProductVisualInfo({ productId, productDetail, reviewCount, reviewRate, initProductOptionList }: ProductVisualInfoProps) {
	const { loginOn, user, isAuthLoading } = useAuth();
	const { handleAddCart, isSuccess: isAddCartSuccess, reset } = useProductCartAction(productId);
	const { mutate: handleStockHold, error: buyNowError } = useProductCheckAndHold();
	const queryClient = useQueryClient();

	// =================================================================
	// React Query
	// =================================================================

	// 제품 옵션 리스트 (장바구니 담기 후 재고 수량 반영)
	const { data: productOptionList = initProductOptionList } = useQuery<GetCartOtherOptionListResponse, Error, ProductOption[]>({
		queryKey: ["productOptions", productId],
		queryFn: () => getNormal(getApiUrl(API_URL.MY_CART_PRODUCT_OPTION), { productId }),
		initialData: { cartOptionProductOptionList: initProductOptionList, message: "SUCCESS" },
		staleTime: 30_000,
		select: (data) => {
			return data.cartOptionProductOptionList;
		},
	});
	// 이용가능쿠폰 조회
	const { data: availableCouponResponse } = useQuery<GetProductDetailCouponResponse, Error, GetProductDetailCouponWithDiscountData>({
		queryKey: ["productCouponList", productId],
		queryFn: () => getNormal(getApiUrl(API_URL.PRODUCT_DETAIL_COUPON), { productId }),
		enabled: loginOn,
		refetchOnWindowFocus: false,
		select: (data) => {
			return {
				...data,
				availableProductCoupon: data.availableProductCoupon.map((coupon) => ({
					...coupon,
					discountAmount: calculateDiscount(productDetail.finalPrice, coupon) || 0,
				})),
			};
		},
	});

	// =================================================================
	// React
	// =================================================================

	// 나의 가격 상세 보기 토글
	const [showMyPriceDetail, setShowMyPriceDetail] = useState(false);
	// 적용된 쿠폰
	const [appliedProductCoupon, setAppliedProductCoupon] = useState<{
		unStackable: ProductCouponWithDiscount | null;
		stackable: ProductCouponWithDiscount[];
	}>({
		unStackable: null,
		stackable: [],
	});
	// 쿠폰 자동 적용 완료 여부
	const [isInitialCouponApplied, setIsInitialCouponApplied] = useState(false);
	// 적립금 사용 여부
	const [mileageUsed, setMileageUsed] = useState(true);
	// 제품 옵션 선택
	const optionSelectHandler = (optionIdx: number) => {
		// console.log("선택된 옵션 id index", optionIdx, productOptionList[optionIdx - 1]);
		const productOption = productOptionList[optionIdx - 1];
		if (productOption) {
			setProductSelectList((prev) => {
				const newList = [...prev];
				const existingIdx = newList.findIndex((option) => option.productOptionId === productOption.productOptionId);
				if (existingIdx === -1 && productOption.stock > 0) {
					newList.push({ ...productOption, quantity: 1 });
				} else if (existingIdx !== -1 && newList[existingIdx].quantity < productOption.stock) {
					newList[existingIdx] = { ...newList[existingIdx], quantity: newList[existingIdx].quantity + 1 };
				}
				return newList;
			});
		}
	};
	// 상품 선택리스트
	const [productSelectList, setProductSelectList] = useState<(ProductOption & { quantity: number })[]>([]);
	// 장바구니 담기 팝업 오픈 키
	const [addCartPopupKey, setAddCartPopupKey] = useState(0);

	// =================================================================
	// useEffect, useMemo
	// =================================================================

	// 나의 가격 상세 정보 계산
	const { totalPrice, useMileage, appliedProductCouponIds } = useMemo(() => {
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
		}

		return {
			totalPrice,
			useMileage: user.mileage > totalPrice ? totalPrice : user.mileage,
			appliedProductCouponIds: [
				...(appliedProductCoupon.unStackable ? [appliedProductCoupon.unStackable.couponId] : []),
				...appliedProductCoupon.stackable.map((coupon) => coupon.couponId),
			],
		};
	}, [appliedProductCoupon, mileageUsed, productDetail, user]);
	// 제품 옵션 들어갈 꺼
	const { optionInitData, optionSelectList } = useMemo(() => {
		const oid = {
			id: 0,
			val: "사이즈",
		};
		const osl = [];
		osl.push(oid);
		osl.push(
			...productOptionList.map((v) => {
				return {
					id: v.productOptionId,
					val: v.size + (v.addPrice > 0 ? `(+ ${money(v.addPrice)})` : "") + (v.stock <= 10 ? ` - [${v.stock}개 남음]` : ""),
				};
			}),
		);
		return {
			optionInitData: oid,
			optionSelectList: osl,
		};
	}, [productOptionList]);
	// 쿠폰 리스트에서 상품쿠폰과 장바구니 쿠폰 분류
	const { productCoupon, cartCoupon } = useMemo(() => {
		if (!availableCouponResponse) return { productCoupon: [], cartCoupon: [] };
		const productCoupon: ProductCouponWithDiscount[] = [];
		const cartCoupon: ProductCouponWithDiscount[] = [];
		if (availableCouponResponse?.availableProductCoupon) {
			availableCouponResponse.availableProductCoupon.forEach((coupon) => {
				if (coupon.sellerName) {
					productCoupon.push(coupon);
				} else {
					cartCoupon.push(coupon);
				}
			});
		}
		return { productCoupon, cartCoupon };
	}, [availableCouponResponse]);
	// 쿠폰 데이터 로드 시 최대 할인 쿠폰 자동 적용
	useEffect(() => {
		if (!availableCouponResponse || isInitialCouponApplied) {
			return; // 이미 초기화했으면 다시 실행 안 함
		}

		// 쿠폰 적용 가능한 쿠폰 filter
		const availableCouponsWithDiscount = availableCouponResponse.availableProductCoupon.filter(
			(coupon) => calculateDiscount(productDetail.finalPrice, coupon) !== null,
		);

		// 중복 불가 쿠폰 중 최대 할인 쿠폰 찾기
		const unStackableCoupons = availableCouponsWithDiscount.filter((c) => !c.isStackable);
		const maxUnStackable = unStackableCoupons.reduce(
			(max, coupon) => (coupon.discountAmount > (max?.discountAmount || 0) ? coupon : max),
			null as ProductCouponWithDiscount | null,
		);

		// 중복 가능 쿠폰들 (모두 적용)
		const stackableCouponList = availableCouponsWithDiscount.filter((c) => c.isStackable);

		setAppliedProductCoupon({
			unStackable: maxUnStackable,
			stackable: stackableCouponList,
		});
		setIsInitialCouponApplied(true); //	 초기화 완료 표시
	}, [availableCouponResponse, isInitialCouponApplied, productDetail.finalPrice]);
	// 장바구니 담기 후 팝업 오픈 및 제품 옵션 리스트 갱신
	useEffect(() => {
		if (!isAddCartSuccess) return;

		setAddCartPopupKey((prev) => prev + 1);
		setProductSelectList([]); // 상품 선택 초기화
		// 제품 옵션 리스트 갱신 (재고 수량 반영)
		queryClient.invalidateQueries({ queryKey: ["productOptions", productId] });

		reset();
	}, [isAddCartSuccess, queryClient, productId, reset]);
	// 상품 점유 실패 시 처리
	useEffect(() => {
		if (!buyNowError) return;

		console.error("상품 점유 실패", buyNowError);
		if (buyNowError.message === "STOCK_HOLD_FAILED") {
			setProductSelectList([]);
			queryClient.invalidateQueries({ queryKey: ["productOptions", productId] });
		}
	}, [buyNowError, queryClient, productId]);
	// 로그인 상태에 가져온 후
	useEffect(() => {
		if (!isAuthLoading) {
			setShowMyPriceDetail(true);
		}
	}, [isAuthLoading]);

	// =================================================================
	// UI
	// =================================================================

	const myPriceCheckboxCommonProps = {
		originPrice: productDetail.originPrice,
		finalPrice: productDetail.finalPrice,
		productId,
	};

	// =================================================================
	// TEST
	// =================================================================

	// 제품 옵션 선택 시 수량 초기화
	useEffect(() => {
		if (productSelectList.length === 0) return;
		console.log({ productSelectList });
	}, [productSelectList]);

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
									{loginOn ? (
										<>
											<div className={styles.myPriceDetails}>
												{productDetail.originPrice !== productDetail.finalPrice && (
													<div>
														<h4>상품 할인</h4>
														<MyPriceCheckboxTooltip type="BASE" {...myPriceCheckboxCommonProps} />
													</div>
												)}
												{productCoupon.length > 0 && (
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
																			? appliedProductCoupon.stackable.some(
																					(c) => c.couponId === coupon.couponId,
																				)
																			: appliedProductCoupon.unStackable?.couponId === coupon.couponId) || false
																	}
																	handleCheckAppliedProductCoupon={(isAdd) => {
																		if (!coupon.isStackable) {
																			setAppliedProductCoupon((prev) => ({
																				...prev,
																				unStackable: isAdd ? coupon : null,
																			}));
																		} else {
																			setAppliedProductCoupon((prev) => ({
																				...prev,
																				stackable: isAdd
																					? [...prev.stackable, coupon]
																					: prev.stackable.filter((c) => c.couponId !== coupon.couponId),
																			}));
																		}
																	}}
																/>
															);
														})}
													</div>
												)}
												{cartCoupon.length > 0 && (
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
																handleCheckAppliedProductCoupon={(isAdd) => {
																	if (!coupon.isStackable) {
																		setAppliedProductCoupon((prev) => ({
																			...prev,
																			unStackable: isAdd ? coupon : null,
																		}));
																	} else {
																		setAppliedProductCoupon((prev) => ({
																			...prev,
																			stackable: isAdd
																				? [...prev.stackable, coupon]
																				: prev.stackable.filter((c) => c.couponId !== coupon.couponId),
																		}));
																	}
																}}
															/>
														))}
													</div>
												)}
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
										</>
									) : (
										<p className="px-4 py-3 text-sm">로그인 후 나의 구매 가격을 확인하세요!</p>
									)}
								</>
							)}
						</div>
					</div>
				</div>

				<div className={styles.productAdditionalInfo}>
					<div className={styles.productMileage}>
						<b>구매 적립금</b>
						<span>최대 {money(calculateMileage(totalPrice))}원 마일리지 적립 예정</span>
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
				{!isAuthLoading && (
					<div className={styles.productOptionBuy}>
						{productOptionList.every((option) => option.stock === 0) ? (
							<p className={styles.soldOut}>품절 상품</p>
						) : (
							<>
								{loginOn ? (
									<div className={styles.productOptionBuyArea}>
										<div className={styles.productOptionSelect}>
											<OptionSelector
												optionSelectorName="productVisualOption"
												pickIdx={0}
												initData={optionInitData}
												optionList={optionSelectList}
												changeOption={optionSelectHandler}
												inputColor="rgb(75 70 70)"
											/>
										</div>
										{/* 선택된 옵션과 수량 보여주는 영역 */}
										{productSelectList.length > 0 && (
											<>
												<div className={styles.selectedOptions}>
													{productSelectList.map((option) => (
														<div key={option.productOptionId} className={styles.selectedOptionItem}>
															<span className={styles.selectedOptionName}>
																{option.size} {option.addPrice > 0 && `(추가금 ${money(option.addPrice)})`}
															</span>
															<div className="flex items-center">
																<span>
																	<ProductCounter
																		count={option.quantity}
																		handleClick={(count) => {
																			setProductSelectList((prev) => {
																				const newList = [...prev];
																				const existingIdx = newList.findIndex(
																					(o) => o.productOptionId === option.productOptionId,
																				);
																				if (existingIdx !== -1) {
																					newList[existingIdx].quantity = count;
																				}
																				return newList;
																			});
																		}}
																		stock={option.stock}
																	/>
																</span>
																<span className="ml-3 font-medium">
																	{money(productDetail.finalPrice + option.addPrice)}원
																</span>
																<button
																	className="inline-flex ml-2 text-3xl"
																	onClick={() => {
																		setProductSelectList((prev) =>
																			prev.filter((o) => o.productOptionId !== option.productOptionId),
																		);
																	}}
																>
																	<IoIosClose />
																</button>
															</div>
														</div>
													))}
												</div>
												<div className={styles.totalPrice}>
													<span className={styles.totalPriceLabel}>총 상품 금액</span>
													<span className={styles.totalPriceValue}>
														{money(
															productSelectList.reduce(
																(acc, option) => acc + (productDetail.finalPrice + option.addPrice) * option.quantity,
																0,
															),
														)}
														원
													</span>
												</div>
											</>
										)}
										<div className={styles.actionButtons}>
											<button className={styles.btnCart} onClick={() => handleAddCart(productSelectList)}>
												장바구니 담기
											</button>
											<button
												className={styles.btnBuy}
												onClick={() => {
													handleStockHold({
														buyList: productSelectList.map((option) => ({
															productOptionId: option.productOptionId,
															count: option.quantity,
															couponIds: appliedProductCouponIds, // 나의 가격에서 쿠폰 적용은 UI에서만 처리, 실제 구매 시에는 쿠폰 적용 안 함
														})),
														returnUrl: `/product/detail/${productId}`,
													});
												}}
											>
												바로 구매하기
											</button>
										</div>
									</div>
								) : (
									<p>로그인 후 구매 가능합니다.</p>
								)}
							</>
						)}
						<AddCartPopup triggerKey={addCartPopupKey} />
					</div>
				)}
			</div>
		</section>
	);
}
