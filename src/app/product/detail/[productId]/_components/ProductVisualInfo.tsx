import { ReviewStar } from "@/components/product/ReviewStar";
import { OptionSelector } from "@/components/ui/OptionSelector";
import Link from "next/link";
import { FaHeart } from "react-icons/fa";
import { GoQuestion } from "react-icons/go";
import { IoIosArrowDown, IoIosArrowUp, IoIosClose } from "react-icons/io";
import styles from "../ProductDetail.module.scss";
import { SmartImage } from "@/components/ui/SmartImage";
import { discountPercent, money } from "@/lib/format";
import { AddCartRequest, AvailableCouponAtProductDetail, ProductOption } from "@/types/product";
import { useEffect, useMemo, useState } from "react";
import { GetProductDetailCouponResponse } from "@/types/product";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNormal, postJson } from "@/api/fetchFilter";
import API_URL from "@/api/endpoints";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useAuth } from "@/hooks/useAuth";
import moment from "moment";
import MyPriceCheckboxTooltip from "@/app/product/detail/[productId]/_components/MyPriceCheckboxTooltip";
import { useRouter } from "next/navigation";
import { calculateDiscount, calculateMileage } from "@/lib/price";
import { ProductCounter } from "@/components/ui/ProductCounter";
import { BaseResponse } from "@/types/common";
import { useModalStore } from "@/store/modal.store";
import { ModalResultMap } from "@/store/modal.type";
import clsx from "clsx";
import { BuyHoldRequest, BuyHoldResponse } from "@/types/buy";

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
	productOptionList: ProductOption[];
}

// 상품 사진 및 가격배송 정보
export default function ProductVisualInfo({ productId, productDetail, reviewCount, reviewRate, productOptionList }: ProductVisualInfoProps) {
	const { loginOn, user, isAuthLoading } = useAuth();
	const { push } = useRouter();
	const { openModal, modalResult, clearModalResult } = useModalStore();
	const queryClient = useQueryClient();

	/* ----- Query ------------------------------------------------------ */

	// 이용가능쿠폰 조회
	const {
		data: availableCouponResponse,
		isSuccess,
		isError,
		isFetching,
	} = useQuery<GetProductDetailCouponResponse, Error, GetProductDetailCouponWithDiscountData>({
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
	// 현재 제품 장바구니 확인
	const { data: hasCart } = useQuery<BaseResponse & { hasCart: boolean }, Error, boolean>({
		queryKey: ["productCartCheck", productId],
		queryFn: () => getNormal(getApiUrl(API_URL.PRODUCT_CART), { productId }),
		enabled: loginOn,
		refetchOnWindowFocus: false,
		select: (data) => {
			return data.hasCart;
		},
	});
	// 장바구니 담기
	const { mutate: addCartMutate } = useMutation({
		mutationKey: ["productDetailAddCart", productId],
		mutationFn: () =>
			postJson<BaseResponse, AddCartRequest>(getApiUrl(API_URL.PRODUCT_CART), {
				addCartList: productSelectList.map((option) => ({
					productOptionId: option.productOptionId,
					quantity: option.quantity,
				})),
				productId,
			}),
		onSuccess: (data) => {
			setCartPopupOpen(true);
			setCartPopupClose(false);
			queryClient.invalidateQueries({ queryKey: ["productCartCheck", productId] });
			if (data.message === "CART_ADD_PARTIAL_SUCCESS") {
				openModal("ALERT", {
					content:
						"재고 수량보다 많은 수량이 선택된 옵션이 있습니다.<br /> 재고가 있는 수량만 장바구니에 담겼습니다.<br /> 옵션과 수량을 확인해주세요.",
				});
			}
			queryClient.invalidateQueries({ queryKey: ["me"] });
		},
		onError: (err) => {
			console.error("장바구니 담기 실패", err);
			if (err.message === "CART_ADD_OUT_OF_STOCK") {
				openModal("ALERT", { content: "재고 수량보다 많은 수량이 선택되었습니다.<br /> 옵션과 수량을 확인해주세요." });
			}
		},
		onSettled: () => {
			setProductSelectList([]);
			queryClient.invalidateQueries({ queryKey: ["productOptions", productId] });
		},
	});
	// 상품 확인 및 점유(바로 구매하기)
	const { mutate: buyNowMutate } = useMutation({
		mutationKey: ["productDetailBuyNow", productId],
		mutationFn: () =>
			postJson<BuyHoldResponse, BuyHoldRequest>(getApiUrl(API_URL.BUY_HOLD), {
				buyList: productSelectList.map((option) => ({
					productOptionId: option.productOptionId,
					count: option.quantity,
				})),
			}),
		onSuccess: (data) => {
			console.log("상품 점유 성공", data);
		},
		onError: (err) => {
			console.error("상품 점유 실패", err);
			if (err.message === "STOCK_HOLD_FAILED") {
				openModal("ALERT", { content: "품절된 상품이 있습니다. 옵션과 수량을 다시 확인해주세요." });
				setProductSelectList([]);
				queryClient.invalidateQueries({ queryKey: ["productOptions", productId] });
			}
		},
	});

	/* ------------------------------------------------------------------ */

	// 나의 가격 구매 가능 가격
	const [totalPrice, setTotalPrice] = useState(productDetail.finalPrice);
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
	// 사용한 적립금
	const [useMileage, setUseMileage] = useState(0);
	// 나의 가격 상세 정보 계산
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
			setUseMileage(user.mileage > totalPrice ? totalPrice : user.mileage);

			totalPrice = Math.max(0, totalPrice - user.mileage);
		}
		setTotalPrice(totalPrice);
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

	// 상품 선택리스트
	const [productSelectList, setProductSelectList] = useState<(ProductOption & { quantity: number })[]>([]);
	useEffect(() => {
		if (productSelectList.length === 0) return;
		console.log({ productSelectList });
	}, [productSelectList]);
	// 장바구니 담기 팝업
	const [cartPopupOpen, setCartPopupOpen] = useState(false);
	const [cartPopupClose, setCartPopupClose] = useState(false);
	// 장바구니 담기 버튼
	const handleAddCart = () => {
		if (productSelectList.length === 0) {
			openModal("ALERT", { content: "옵션을 선택해주세요." });
			return;
		}
		if (hasCart) {
			openModal("CONFIRM", {
				content: "이미 장바구니에 담긴 상품입니다. 추가로 담으시겠습니까?",
				okText: "추가 담기",
				okResult: "ADDCART",
				reverse: true,
			});
			return;
		}
		addCartMutate();
	};
	//
	useEffect(() => {
		if (modalResult?.action === "CONFIRM_OK") {
			const payload = modalResult.payload as ModalResultMap["CONFIRM_OK"];
			// 장바구니 담기
			if (payload?.result === "ADDCART") {
				addCartMutate();
			}
		}
		clearModalResult();
	}, [modalResult, clearModalResult, addCartMutate]);
	// 장바구니 담기 팝업 애니메이션 및 자동 닫힘
	useEffect(() => {
		if (!cartPopupOpen) return;
		const closeTimer = setTimeout(() => {
			setCartPopupClose(true);
		}, 2000);
		return () => clearTimeout(closeTimer);
	}, [cartPopupOpen]);

	/* ------------------------------------------------------------------ */

	const myPriceCheckboxCommonProps = {
		originPrice: productDetail.originPrice,
		finalPrice: productDetail.finalPrice,
		productId,
	};
	// 로그인 상태에 가져온 후
	useEffect(() => {
		if (!isAuthLoading) {
			setShowMyPriceDetail(true);
		}
	}, [isAuthLoading]);

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
											<button className={styles.btnCart} onClick={handleAddCart}>
												장바구니 담기
											</button>
											<button
												className={styles.btnBuy}
												onClick={() => {
													buyNowMutate();
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
						{cartPopupOpen && (
							<div
								className={clsx(styles.addCartPopup, cartPopupClose && "animateFadeOut")}
								onAnimationEnd={() => {
									if (!cartPopupClose) return;
									setCartPopupOpen(false);
									setCartPopupClose(false);
								}}
							>
								<p>
									장바구니에
									<br />
									담겼습니다.
								</p>
							</div>
						)}
					</div>
				)}
			</div>
		</section>
	);
}
