"use client";

import { CartItem, GetCartResponse, UpdateCartRequest, UpdateCartSelectedRequest } from "@/types/mypage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API_URL from "@/api/endpoints";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useAuth } from "@/hooks/useAuth";
import { IoIosArrowDown, IoIosArrowUp, IoIosClose } from "react-icons/io";
import { BsExclamationCircle } from "react-icons/bs";
import { deleteNormal, getNormal, postJson, putJson } from "@/api/fetchFilter";
import { money } from "@/lib/format";
import { BaseResponse } from "@/types/common";
import React, { useEffect, useMemo, useState } from "react";
import { LodingWrap } from "@/components/common/LodingWrap";
import { useModalStore } from "@/store/modal.store";
import { ModalResultMap } from "@/store/modal.type";
import Error from "next/error";
import { ImageFill } from "@/components/common/ImageFill";
import styles from "./CartClient.module.scss";
import { WishButton } from "@/components/product/WishButton";

type BrandGroupEntry = [sellerName: string, items: CartItem[]];

export default function CartClient() {
	const { loginOn } = useAuth();
	const queryClient = useQueryClient();
	const { openModal, modalResult, clearModalResult } = useModalStore();

	// 장바구니 리스트 조회
	// invalidateQueries(["cartList"])
	const {
		data: brandGroupList = [],
		isLoading,
		isFetching,
	} = useQuery<GetCartResponse, Error, BrandGroupEntry[]>({
		queryKey: ["cartList"],
		queryFn: async () => await getNormal(getApiUrl(API_URL.MY_CART)),
		select: (data) => {
			const brandGroup: Record<string, CartItem[]> = {};

			data.cartList.map((cart) => {
				// 브랜드별 그룹을 묶기
				if (!brandGroup[cart.sellerName]) brandGroup[cart.sellerName] = [];
				brandGroup[cart.sellerName].push(cart);
			});
			return Object.entries(brandGroup);
		},
		enabled: loginOn,
	});
	// 장바구니 제품 옵션/수량 변경
	const handleChangeQuantity = useMutation<BaseResponse, Error, UpdateCartRequest>({
		mutationFn: ({ cartId, productOptionId, quantity }) =>
			postJson<BaseResponse>(getApiUrl(API_URL.MY_CART), { cartId, productOptionId, quantity }),
		// Mutation이 시작되기 직전에 특정 작업을 수행
		onMutate(variables) {
			console.log(variables);
		},
		onSuccess(data, variables, context) {
			console.log(data, variables, context);
		},
		onError(err, variables, context) {
			console.log(err, variables, context);
		},
		// 결과에 관계 없이 무언가 실행됨
		onSettled(data, error, variables, context) {},
	});
	// 장바구니 선택여부 변경
	const handleChangeSelected = useMutation<BaseResponse, Error, UpdateCartSelectedRequest>({
		mutationFn: ({ cartIdList, selected }) => putJson<BaseResponse>(getApiUrl(API_URL.MY_CART), { cartIdList, selected }),
		// Mutation이 시작되기 직전에 특정 작업을 수행
		onMutate(a) {
			console.log(a);
		},
		onSuccess(data) {
			console.log(data);
		},
		onError(err) {
			console.log(err);
		},
		// 결과에 관계 없이 무언가 실행됨
		onSettled(a, b) {},
	});
	// 장바구니 제품 삭제
	const handleCartProductDelete = useMutation<BaseResponse, Error, { cartIdList: number[] }>({
		mutationFn: ({ cartIdList }) => deleteNormal<BaseResponse>(getApiUrl(API_URL.MY_CART), { cartIdList }),
		// Mutation이 시작되기 직전에 특정 작업을 수행
		onMutate(a) {
			console.log(a);
		},
		onSuccess(data) {
			console.log(data);
		},
		onError(err) {
			console.log(err);
		},
		// 결과에 관계 없이 무언가 실행됨
		onSettled(a, b) {},
	});
	/* ----------------------------------- */
	const { allSelected, anySelected, totalCount, selectedCount, unselectedCartIdList, selectedCartIdList } = useMemo(() => {
		const items = brandGroupList.flatMap(([, carts]) => carts);
		const total = items.length;
		const selected = items.filter((c) => c.selected).length;
		const allSelected = total > 0 && selected === total;

		return {
			totalCount: total, // UI에 “3/5 선택” 표시 가능
			selectedCount: selected, // UI에 “3/5 선택” 표시 가능
			allSelected, // 전체 체크박스 checked에 사용
			anySelected: selected > 0, // “하나라도 선택” (예: 삭제 버튼 활성화)
			unselectedCartIdList: items.filter((c) => (allSelected ? true : !c.selected)).map((c) => c.cartId), // 전체 선택 변경을 위한 cartId들
			selectedCartIdList: items.filter((c) => c.selected).map((c) => c.cartId),
		};
	}, [brandGroupList]);
	/* ----------------------------------- */
	// 옵션변경 모달 오픈
	const openOptionChangeModal = (product: CartItem) => {
		openModal("PRODUCTOPTION", {
			product,
		});
	};
	// 장바구니 제품삭제 모달 오픈
	const [deletingCartIdList, setDeletingCartIdList] = useState<number[]>([]);
	const cartDeleteModalOpen = (content: string) => {
		openModal("CONFIRM", {
			content,
		});
	};
	// 모달 닫힌 후 처리
	useEffect(() => {
		if (!modalResult) return;
		// 옵션변경
		if (modalResult.action === "PRODUCTOPTION_CHANGED") {
			const p = modalResult.payload as ModalResultMap["PRODUCTOPTION_CHANGED"];

			// ✅ 여기서 장바구니 상태 갱신 / react-query invalidate / toast 등 처리
			// await mutateOptionChange(p.nextProductOptionId) ...
			// queryClient.invalidateQueries({ queryKey: ["cartList"] });

			console.log("옵션 변경 결과:", p);
			const changeCartOption = async () => {
				await handleChangeQuantity.mutateAsync({ cartId: p.cartId, productOptionId: p.productOptionId, quantity: p.quantity });
				queryClient.invalidateQueries({ queryKey: ["cartList"] });
			};
			changeCartOption();
		}
		// 장바구니 제품삭제
		if (modalResult.action === "CONFIRM_OK") {
			const deleteCart = async () => {
				await handleCartProductDelete.mutateAsync({ cartIdList: deletingCartIdList });
				queryClient.invalidateQueries({ queryKey: ["cartList"] });
			};
			deleteCart();
		}
		// ✅ 한 번 처리했으면 비워주기 (중복 처리 방지)
		clearModalResult();
	}, [modalResult, clearModalResult, deletingCartIdList, handleCartProductDelete, handleChangeQuantity, queryClient]);

	return (
		<main id="cart" className={styles.cart}>
			<div className={styles.cartFrame}>
				<h1 className={`${styles.cartTitle} py-3`}>장바구니</h1>

				<div className={styles.cartWrap}>
					{(isLoading || isFetching) && <LodingWrap />}

					{/* 2열 레이아웃 컨테이너 (grid는 CSS에서) */}
					{/* 좌측: 상품 영역 */}
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

							{/* 브랜드 그룹 */}
							{brandGroupList?.map((brandGroup, brandGroupIdx) => {
								const brandName = brandGroup[0];
								const productList = brandGroup[1];
								const brnadSelectedCount = productList.filter((v) => v.selected).length;
								const brandAllchecked = brnadSelectedCount === productList.length;
								const brandAllCartIdList = productList.filter((v) => (brandAllchecked ? true : !v.selected)).map((v) => v.cartId);

								return (
									<React.Fragment key={"cartBrand-" + brandName}>
										{brandGroupIdx > 0 && <hr className={styles.productBrandDivider} />}

										<article className={styles.brandGroup} aria-labelledby="brand-denmade">
											<h2 className={styles.brandGroupHeader}>
												<span className={styles.brandGroupLeft}>
													<span className={styles.brandGroupCheck}>
														<input
															id="group-denmade"
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

													<label className={styles.brandGroupTitle} id="brand-denmade" htmlFor="group-denmade">
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
													const selectDisabled = product.stock < product.quantity;

													let productAlarm = "";
													if (product.stock !== 0 && selectDisabled) {
														productAlarm = "재고가 부족합니다. 옵션을 변경하시면 선택이 가능합니다.";
													}

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
																		<a href="" className={styles.productItemThumb}>
																			<ImageFill src={product.filePath} alt={product.fileName} />

																			{selectDisabled && (
																				<div className={styles.productOutOfStockCover}>
																					<span className={styles.productOutOfStockSticker}>
																						{product.stock === 0 && "품절"}
																						{product.stock !== 0 && selectDisabled && "재고부족"}
																					</span>
																				</div>
																			)}
																		</a>

																		<WishButton
																			productId={product.productId}
																			initWishOn={product.wishId !== null}
																		/>
																	</div>

																	<div className={styles.productItemContent}>
																		<div className={styles.productItemInfo}>
																			<a href="" className={styles.productItemName}>
																				{product.productName}
																			</a>

																			<p className={styles.productItemOption}>
																				{product.size} / {product.quantity}개
																			</p>

																			{/* 10개 이하 시에 표시 */}
																			{product.stock < 10 && (
																				<div className={styles.productItemWarning}>
																					<span>품절임박 {product.stock}개 남음</span>
																				</div>
																			)}

																			<div className={styles.productItemPrices}>
																				<h5 className={`${styles.price} ${styles.priceSale}`}>
																					<del>129,000원</del>
																				</h5>
																				<h5 className={`${styles.price} ${styles.priceOrigin}`}>
																					<span>{money(product.finalPrice)}원</span>
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
																	<button className="btn btn--ghost" onClick={() => openOptionChangeModal(product)}>
																		옵션 변경
																	</button>
																	<button className="btn btn--ghost">쿠폰 사용</button>
																</div>
															</div>

															<div className={styles.productItemDelete}>
																<button
																	onClick={() => {
																		setDeletingCartIdList([product.cartId]);
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

					{/* 우측: 요약/혜택/유의사항/CTA */}
					<aside className={styles.priceWrap} aria-label="주문 요약">
						<div className={`${styles.priceOutline} ${styles.summaryCard}`}>
							<div className={`${styles.priceCount} ${styles.summaryCardSection}`}>
								<div className={`${styles.title} ${styles.summaryCardTitle}`}>구매금액</div>

								<div className={styles.priceLine}>
									<div className={styles.infoName}>상품 금액</div>
									<div className={styles.priceNum} data-field="subtotal">
										185,000원
									</div>
								</div>

								<div className={styles.priceLine}>
									<div>할인 금액</div>
									<div className="text-blue-700">-39,960원</div>
								</div>

								<div className={styles.priceLine}>
									<div>배송비</div>
									<div className="text-blue-700">무료배송</div>
								</div>

								<div className={`mt-4 font-bold ${styles.priceLine} ${styles.priceLineTotal}`}>
									<div>총 구매 금액</div>
									<div aria-live="polite">
										<span className="mr-2 text-red-500 align-baseline summary__badge">22%</span>
										<span className="align-baseline" data-field="total">
											145,040원
										</span>
									</div>
								</div>

								<div className={styles.priceLine}>
									<div>적립혜택 예상</div>
									<div>최대 5,120</div>
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
											<img src="/images/kakaopay-seeklogo.png" alt="카카오페이이미지" />
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
								<button className={styles.noticeToggle} type="button">
									유의사항 {true ? <IoIosArrowDown /> : <IoIosArrowUp />}
								</button>
							</div>
						</div>

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

						<div>
							<button className="w-full px-5 py-3 btn--black">145,040원 구매하기 ({selectedCount}개)</button>
						</div>
					</aside>
				</div>
			</div>
		</main>
	);
}
