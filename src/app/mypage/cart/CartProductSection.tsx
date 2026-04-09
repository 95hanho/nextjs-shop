// 2열 레이아웃 컨테이너 (grid는 CSS에서)
// 좌측: 상품 영역

import styles from "./Cart.module.scss";

import { CartItem, UpdateCartRequest, UpdateCartSelectedRequest } from "@/types/mypage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API_URL from "@/api/endpoints";
import { getApiUrl } from "@/lib/getBaseUrl";
import { IoIosClose } from "react-icons/io";
import { BsExclamationCircle } from "react-icons/bs";
import { deleteNormal, postJson, putJson } from "@/api/fetchFilter";
import { discountPercent, money } from "@/lib/format";
import { BaseResponse } from "@/types/common";
import React, { useEffect, useRef, useState } from "react";
import { useModalStore } from "@/store/modal.store";
import Error from "next/error";
import { SmartImage } from "@/components/ui/SmartImage";
import { WishButton } from "@/components/product/WishButton";
import {
	AppliedCartCoupon,
	AppliedProductCouponMap,
	BrandGroupEntry,
	CartCoupon,
	CartItemSelectCollection,
	SellerCoupon,
} from "@/app/mypage/cart/CartClient";
import Link from "next/link";
import CartCouponSelector from "@/app/mypage/cart/CartCouponSelector";
import { scrollIntoCenter } from "@/utils/ui";
import { MaxDiscountBanner } from "@/components/buy/MaxDiscountBanner";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import { DialogResultMap, DomainModalResultMap } from "@/store/modal.type";

interface CartProductSectionProps extends CartItemSelectCollection {
	noResetCouponOn: () => void;
	//
	brandGroupList: BrandGroupEntry[];
	cartCouponList: CartCoupon[];
	sellerCouponList: SellerCoupon[];
	appliedProductCouponMap: AppliedProductCouponMap;
	changeAppliedProductCoupon: (cartId: number, coupon: AppliedCartCoupon, isChecked: boolean) => void;
	/*  */
	isMaxDiscountApplied: boolean;
	maxDiscountPrice: number;
	sumCouponDiscount: number;
	changeMaxDiscountApplied: () => void;
}

export default function CartProductSection({
	noResetCouponOn,
	//
	brandGroupList,
	cartCouponList,
	sellerCouponList,
	appliedProductCouponMap,
	changeAppliedProductCoupon,
	//
	selectedCount,
	allSelected,
	anySelected,
	unselectedCartIdList,
	selectedCartIdList,
	//
	isMaxDiscountApplied,
	maxDiscountPrice,
	sumCouponDiscount,
	changeMaxDiscountApplied,
}: CartProductSectionProps) {
	const queryClient = useQueryClient();
	const { openModal, modalResult, clearModalResult } = useModalStore();
	const { openDialog, dialogResult, clearDialogResult } = useGlobalDialogStore();

	// 최대 할인 적용여부
	const isMaxDiscountStatus = isMaxDiscountApplied || sumCouponDiscount === maxDiscountPrice;

	// =================================================================
	// React Query
	// =================================================================

	// 장바구니 제품 옵션/수량 변경
	const handleChangeQuantity = useMutation<BaseResponse, Error, UpdateCartRequest>({
		mutationFn: ({ cartId, productOptionId, quantity }) =>
			postJson<BaseResponse>(getApiUrl(API_URL.MY_CART), { cartId, productOptionId, quantity }),
		// Mutation이 시작되기 직전에 특정 작업을 수행
		// onMutate(variables) {
		// 	console.log(variables);
		// },
		// onSuccess(data, variables, context) {
		// 	console.log(data, variables, context);
		// },
		onError(err, variables, context) {
			console.log(err, variables, context);
		},
		// 결과에 관계 없이 무언가 실행됨
		// onSettled(data, error, variables, context) {},
	});
	// 장바구니 선택여부 변경
	const handleChangeSelected = useMutation<BaseResponse, Error, UpdateCartSelectedRequest>({
		mutationFn: ({ cartIdList, selected }) => putJson<BaseResponse>(getApiUrl(API_URL.MY_CART), { cartIdList, selected }),
		// Mutation이 시작되기 직전에 특정 작업을 수행
		// onMutate(a) {
		// 	console.log(a);
		// },
		// onSuccess(data) {
		// 	console.log(data);
		// },
		onError(err) {
			console.log(err);
		},
		// 결과에 관계 없이 무언가 실행됨
		// onSettled(a, b) {},
	});
	// 장바구니 제품 삭제
	const handleCartProductDelete = useMutation<BaseResponse, Error, { cartIdList: number[] }>({
		mutationFn: ({ cartIdList }) => deleteNormal<BaseResponse>(getApiUrl(API_URL.MY_CART), { cartIdList }),
		// Mutation이 시작되기 직전에 특정 작업을 수행
		// onMutate(a) {
		// 	console.log(a);
		// },
		// onSuccess(data) {
		// 	console.log(data);
		// },
		onError(err) {
			console.log(err);
		},
		// 결과에 관계 없이 무언가 실행됨
		// onSettled(a, b) {},
	});

	// =================================================================
	// React
	// =================================================================

	// 모달 오픈 시 selected 상태 - selected가 안된거를 옵션 변경이나 삭제 시에 쿠폰초기화 안하기
	const modalOpenSelectedState = useRef<boolean>(false);
	// 옵션변경 모달 오픈
	const openOptionChangeModal = (product: CartItem) => {
		if (!product.selected) modalOpenSelectedState.current = true; // 모달 열 때의 selected 상태 저장
		openModal("PRODUCT_OPTION", {
			product,
			closeResult: "PRODUCT_OPTION_CHANGE_CANCEL",
		});
	};
	// 장바구니 제품삭제 모달 오픈
	const [deletingCartIdList, setDeletingCartIdList] = useState<number[]>([]);
	const cartDeleteModalOpen = (content: string) => {
		openDialog("CONFIRM", {
			content,
			closeResult: "CART_DELETE_CANCEL",
		});
	};
	// 공통모달 닫힌 후 처리
	useEffect(() => {
		if (!dialogResult) return;

		// 장바구니 제품삭제
		if (dialogResult.action === "CONFIRM_OK") {
			const deleteCart = async () => {
				await handleCartProductDelete.mutateAsync({ cartIdList: deletingCartIdList });
				if (modalOpenSelectedState.current) {
					noResetCouponOn(); // 삭제 시 selected 상태가 안된 경우 쿠폰 초기화 방지
				}
				queryClient.invalidateQueries({ queryKey: ["cartList"] });
			};
			deleteCart();
		}

		// ✅ 한 번 처리했으면 비워주기 (중복 처리 방지)
		clearDialogResult();
	}, [clearDialogResult, dialogResult, deletingCartIdList, handleCartProductDelete, queryClient, noResetCouponOn]);
	// 도메인 모달 닫힌 후 처리
	useEffect(() => {
		if (!modalResult) return;

		// 장바구니 제품 옵션변경
		if (modalResult.action === "PRODUCT_OPTION_CHANGED") {
			const p = modalResult.payload as DomainModalResultMap["PRODUCT_OPTION_CHANGED"];

			// ✅ 여기서 장바구니 상태 갱신 / react-query invalidate / toast 등 처리
			// await mutateOptionChange(p.nextProductOptionId) ...
			// queryClient.invalidateQueries({ queryKey: ["cartList"] });

			const changeCartOption = async () => {
				await handleChangeQuantity.mutateAsync({ cartId: p.cartId, productOptionId: p.productOptionId, quantity: p.quantity });
				if (modalOpenSelectedState.current) {
					noResetCouponOn(); // 옵션 변경 시 selected 상태가 안된 경우 쿠폰 초기화 방지
				}
				queryClient.invalidateQueries({ queryKey: ["cartList"] });
			};
			changeCartOption();
		}
		if (modalResult?.action === "DOMAIN_CLOSE") {
			const payload = modalResult.payload as DomainModalResultMap["DOMAIN_CLOSE"];
			if (payload?.result === "PRODUCT_OPTION_CHANGE_CANCEL" || payload?.result === "CART_DELETE_CANCEL") {
				// 옵션 변경 모달이 닫혔을 때
				modalOpenSelectedState.current = false;
			}
		}

		// ✅ 한 번 처리했으면 비워주기 (중복 처리 방지)
		clearModalResult();
	}, [modalResult, clearModalResult, handleChangeQuantity, queryClient, noResetCouponOn]);

	// 쿠폰변경 UI 열기(판매자이름)
	const [couponAppliedSelectorOpenSeller, setCouponAppliedSelectorOpenSeller] = useState<string>("");
	// 열리는 버튼 요소에 ref를 저장
	const panelRef = useRef<HTMLElement | null>(null);
	// 열릴 때 닫힌 스크롤위치 저장
	const scrollYRef = useRef<number | null>(null);

	// 열림 상태가 바뀌면 다음 프레임에서 스크롤
	useEffect(() => {
		requestAnimationFrame(() => {
			if (couponAppliedSelectorOpenSeller) {
				if (panelRef.current) scrollIntoCenter(panelRef.current);
			} else if (scrollYRef.current !== null) {
				scrollTo({ top: scrollYRef.current, behavior: "instant" });
				scrollYRef.current = null;
			}
		});
	}, [couponAppliedSelectorOpenSeller]);

	return (
		<section className={styles.productWrap} aria-label="상품 영역">
			<div className={styles.productOutline}>
				{/* 상단 툴바 */}
				<div className={styles.productToolbar}>
					<label className={styles.productToolbarSelect} htmlFor="selectAll">
						<input
							id="selectAll"
							type="checkbox"
							className="checkbox checkbox--lg"
							checked={allSelected}
							onChange={async () => {
								await handleChangeSelected.mutateAsync({ cartIdList: unselectedCartIdList, selected: !allSelected });
								queryClient.invalidateQueries({ queryKey: ["cartList"] });
							}}
						/>
						<span>전체 선택</span>
					</label>

					<button
						className="btn btn--text"
						data-action="removeSelected"
						disabled={!anySelected}
						onClick={() => {
							setDeletingCartIdList([...selectedCartIdList]);
							cartDeleteModalOpen(`선택된 ${selectedCount}개 제품을 장바구니에서 삭제하시겠습니까?`);
						}}
					>
						선택 삭제
					</button>
				</div>

				<hr className={styles.productOutlineDivider} />

				{sumCouponDiscount > 0 && (
					<MaxDiscountBanner isMaxDiscountStatus={isMaxDiscountStatus} changeMaxDiscountApplied={changeMaxDiscountApplied} />
				)}

				{/* 브랜드 그룹 */}
				{brandGroupList?.map((brandGroup, brandGroupIdx) => {
					const brandName = brandGroup[0];
					const productList = brandGroup[1];
					const brandSelectedCount = productList.filter((v) => v.selected).length;
					const brandAllchecked = brandSelectedCount === productList.length;
					const brandAllCartIdList = productList.filter((v) => (brandAllchecked ? true : !v.selected)).map((v) => v.cartId);

					return (
						<React.Fragment key={"cartBrand-" + brandName}>
							{brandGroupIdx > 0 && <hr className={styles.productBrandDivider} />}

							<article className={styles.brandGroup} aria-labelledby={`brand-${brandName}`}>
								<h2 className={styles.brandGroupHeader}>
									<span className={styles.brandGroupLeft}>
										<span className={styles.brandGroupCheck}>
											{/* 브랜드 상품 전체선택 */}
											<input
												id={`group-${brandName}`}
												type="checkbox"
												className="checkbox"
												checked={brandAllchecked}
												onChange={async () => {
													await handleChangeSelected.mutateAsync({
														cartIdList: brandAllCartIdList,
														selected: !brandAllchecked,
													});
													queryClient.invalidateQueries({ queryKey: ["cartList"] });
												}}
											/>
										</span>

										<label className={styles.brandGroupTitle} id={`brand-${brandName}`} htmlFor={`group-${brandName}`}>
											{brandName}
										</label>
									</span>

									<a href="#" className={styles.brandGroupLink}>
										브랜드숍
									</a>
								</h2>

								{/* 상품 리스트 */}
								<ul className={styles.productList}>
									{/* 상품 하나 */}
									{productList.map((product) => {
										const initialOriginPrice = (product.originPrice + product.addPrice) * product.quantity;
										const initialFinalPrice = (product.finalPrice + product.addPrice) * product.quantity;
										const selectDisabled = product.stock < product.quantity;

										let productAlarm = "";
										if (product.stock !== 0 && selectDisabled) {
											productAlarm = "재고가 부족합니다. 옵션을 변경하시면 선택이 가능합니다.";
										}

										// 해당 장바구니상품에 적용 가능한 장바구니 쿠폰 리스트
										const availableCartCoupons = cartCouponList.filter(
											(coupon) =>
												(coupon.isProductRestricted && coupon.couponAllowedId && coupon.productId === product.productId) ||
												(!coupon.isProductRestricted && !coupon.couponAllowedId),
										);
										// 해당 장바구니상품에 적용 가능한 판매자 쿠폰 리스트
										const availableProductCoupons = sellerCouponList.filter(
											(coupon) =>
												(coupon.isProductRestricted && coupon.couponAllowedId && coupon.productId === product.productId) ||
												(!coupon.isProductRestricted && !coupon.couponAllowedId),
										);
										// 적용 가능한 쿠폰 갯수
										const availableProductCouponCount = availableProductCoupons.length + availableCartCoupons.length;

										// 해당 장바구니에 적용된 쿠폰 정보 가져오기
										const appliedProductCoupon = appliedProductCouponMap[product.cartId];
										// console.log({ appliedProductCoupon });
										// 쿠폰이 하나라도 적용이 됐는지 여부
										const appliedCouponCount = !appliedProductCoupon
											? 0
											: appliedProductCoupon?.stackable.length + (appliedProductCoupon?.unStackable ? 1 : 0);

										return (
											<li key={"cartBrandItem-" + product.cartId} className={styles.productItem} data-sku="DEN0861">
												{/* 상품 체크 */}
												<div className={styles.productItemCheck}>
													<input
														id="item-DEN0861"
														type="checkbox"
														className="checkbox"
														checked={product.selected}
														disabled={selectDisabled}
														onChange={async () => {
															await handleChangeSelected.mutateAsync({
																cartIdList: [product.cartId],
																selected: !product.selected,
															});
															queryClient.invalidateQueries({ queryKey: ["cartList"] });
														}}
													/>
												</div>

												<div className={styles.productItemSection}>
													<div className={styles.productItemOverview}>
														<div className={styles.productItemMedia}>
															<Link href={`/product/detail/${product.productId}`} className={styles.productItemThumb}>
																<SmartImage src={product.filePath} alt={product.fileName} fill={true} />

																{selectDisabled && (
																	<div className={styles.productOutOfStockCover}>
																		<span className={styles.productOutOfStockSticker}>
																			{product.stock === 0 && "품절"}
																			{product.stock !== 0 && selectDisabled && "재고부족"}
																		</span>
																	</div>
																)}
															</Link>

															<WishButton
																productId={product.productId}
																initWishOn={product.wishId !== null}
																clickHandler={() => {
																	noResetCouponOn(); // 쿠폰 초기화 방지
																	queryClient.invalidateQueries({ queryKey: ["cartList"] });
																}}
															/>
														</div>

														<div className={styles.productItemContent}>
															<div className={styles.productItemInfo}>
																<Link
																	href={`/product/detail/${product.productId}`}
																	className={styles.productItemName}
																>
																	{product.productName}
																	{/* <span className="test">cartId({product.cartId})</span> */}
																</Link>

																<p className={styles.productItemOption}>
																	{product.size}
																	{product.addPrice > 0 && `(+${money(product.addPrice)})`} / {product.quantity}개
																</p>

																{/* 10개 이하 시에 표시 */}
																{product.stock < 10 && (
																	<div className={styles.productItemWarning}>
																		<span>품절임박 {product.stock}개 남음</span>
																	</div>
																)}

																<div className={styles.productItemPrices}>
																	<h5 className={`${styles.price} ${styles.priceSale}`}>
																		<b>{discountPercent(initialOriginPrice, product.discountedPrice)}%</b>
																		<del>{money(initialOriginPrice)}원</del>
																	</h5>
																	<h5 className={`${styles.price} ${styles.priceOrigin}`}>
																		<span>{money(initialFinalPrice - product.discountAmount)}원</span>
																	</h5>
																</div>
															</div>
														</div>
													</div>

													{productAlarm && <p className={styles.productAlert}>* {productAlarm}</p>}

													<h5 className={styles.productItemDelivery}>
														<b>10.02(목) 도착 예정</b>
														<span>
															<BsExclamationCircle />
														</span>
													</h5>

													<div className={styles.productItemActions}>
														<button onClick={() => openOptionChangeModal(product)}>옵션 변경</button>
														{/* 하나라도 쿠폰 적용 됐으면 '변경' */}
														{product.selected ? (
															<>
																{availableProductCouponCount > 0 ? (
																	<button
																		onClick={(e) => {
																			if (couponAppliedSelectorOpenSeller === product.sellerName) {
																				setCouponAppliedSelectorOpenSeller("");
																			} else {
																				panelRef.current = e.currentTarget;
																				scrollYRef.current = window.scrollY;
																				setCouponAppliedSelectorOpenSeller(product.sellerName);
																			}
																		}}
																	>
																		{couponAppliedSelectorOpenSeller === product.sellerName
																			? "닫기"
																			: appliedCouponCount > 0
																				? `쿠폰 변경(${appliedCouponCount})`
																				: "쿠폰 사용"}
																	</button>
																) : (
																	<button className="bg-gray-200 opacity-60">적용 가능 쿠폰 없음</button>
																)}
															</>
														) : (
															<button
																className="bg-gray-200 opacity-60"
																onClick={() => {
																	openDialog("ALERT", {
																		content: "쿠폰을 적용하려면 상품을 선택해주세요.",
																	});
																}}
															>
																선택 후 적용
															</button>
														)}
													</div>
													{product.selected && couponAppliedSelectorOpenSeller === product.sellerName && (
														<div className={styles.productItemAppliedCouponList}>
															<div className={styles.appliedCouponListTitle}>
																<div className="mb-2">
																	<h4 className="mb-1 text-gray-500">상품 할인</h4>
																	<CartCouponSelector
																		type="BASE"
																		originXQuantity={initialOriginPrice}
																		finalXQuantity={initialFinalPrice}
																	/>
																</div>
																<div className="mb-2">
																	<h4 className="mb-1 text-gray-500">상품 쿠폰 할인</h4>
																	{availableProductCoupons.map((coupon) => {
																		// 중복불가 쿠폰일 시 검사
																		const unStackableChecked =
																			!coupon.isStackable &&
																			appliedProductCoupon?.unStackable?.couponId === coupon.couponId;
																		// 중복가능 쿠폰일 시 검사
																		const stackableChecked =
																			coupon.isStackable &&
																			appliedProductCoupon?.stackable?.some(
																				(c) => c.couponId === coupon.couponId,
																			);
																		// checked 여부
																		const couponChecked = unStackableChecked || stackableChecked;
																		// otherUsed - 다른 쿠폰이 사용중
																		// console.log({
																		// 	cartId: product.cartId,
																		// 	["쿠폰이름"]: coupon.description,
																		// 	couponChecked,
																		// 	used: coupon.used,
																		// });
																		const otherUsed = !couponChecked && coupon.used;

																		return (
																			<CartCouponSelector
																				key={"CartCouponSelector-" + coupon.couponId}
																				type="COUPON"
																				coupon={coupon}
																				couponChecked={couponChecked}
																				finalXQuantity={initialFinalPrice}
																				handleCheckAppliedProductCoupon={(isAdd) => {
																					changeAppliedProductCoupon(product.cartId, coupon, isAdd);
																				}}
																				otherUsed={otherUsed}
																				productOptionId={product.productOptionId}
																				handleAfterCouponDownload={() => {
																					noResetCouponOn(); // 쿠폰 초기화 방지
																					queryClient.invalidateQueries({ queryKey: ["cartList"] });
																				}}
																			/>
																		);
																	})}
																</div>
																<div>
																	<h4 className="mb-1 text-gray-500">장바구니 쿠폰 할인</h4>
																	{availableCartCoupons.map((coupon) => {
																		// 중복불가 쿠폰일 시 검사
																		const unStackableChecked =
																			!coupon.isStackable &&
																			appliedProductCoupon?.unStackable?.couponId === coupon.couponId;
																		// 중복가능 쿠폰일 시 검사
																		const stackableChecked =
																			coupon.isStackable &&
																			appliedProductCoupon?.stackable?.some(
																				(c) => c.couponId === coupon.couponId,
																			);
																		// checked 여부
																		const couponChecked = unStackableChecked || stackableChecked;
																		const otherUsed = !couponChecked && coupon.used;

																		return (
																			<CartCouponSelector
																				key={"CartCouponSelector-" + coupon.couponId}
																				type="COUPON"
																				coupon={coupon}
																				couponChecked={couponChecked}
																				finalXQuantity={initialFinalPrice}
																				handleCheckAppliedProductCoupon={(isAdd) => {
																					changeAppliedProductCoupon(product.cartId, coupon, isAdd);
																				}}
																				otherUsed={otherUsed}
																				productOptionId={product.productOptionId}
																				handleAfterCouponDownload={() => {
																					noResetCouponOn(); // 쿠폰 초기화 방지
																					queryClient.invalidateQueries({ queryKey: ["cartList"] });
																				}}
																			/>
																		);
																	})}
																</div>
															</div>
														</div>
													)}
												</div>

												<div className={styles.productItemDelete}>
													<button
														onClick={() => {
															setDeletingCartIdList([product.cartId]);
															if (!product.selected) modalOpenSelectedState.current = true;
															cartDeleteModalOpen("해당 제품을 장바구니에서 삭제하시겠습니까?");
														}}
													>
														<IoIosClose />
													</button>
												</div>
											</li>
										);
									})}
								</ul>
							</article>
						</React.Fragment>
					);
				})}
			</div>
		</section>
	);
}
