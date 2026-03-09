// 2열 레이아웃 컨테이너 (grid는 CSS에서)
// 좌측: 상품 영역

import styles from "./CartClient.module.scss";

import { CartItem, UpdateCartRequest, UpdateCartSelectedRequest } from "@/types/mypage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API_URL from "@/api/endpoints";
import { getApiUrl } from "@/lib/getBaseUrl";
import { IoIosClose } from "react-icons/io";
import { BsExclamationCircle } from "react-icons/bs";
import { deleteNormal, postJson, putJson } from "@/api/fetchFilter";
import { money } from "@/lib/format";
import { BaseResponse } from "@/types/common";
import React, { useEffect, useState } from "react";
import { useModalStore } from "@/store/modal.store";
import { ModalResultMap } from "@/store/modal.type";
import Error from "next/error";
import { SmartImage } from "@/components/ui/SmartImage";
import { WishButton } from "@/components/product/WishButton";
import { BrandGroupEntry, CartItemSelectCollection } from "@/app/mypage/cart/CartClient";

interface CartProductSectionProps extends CartItemSelectCollection {
	brandGroupList: BrandGroupEntry[];
}

export default function CartProductSection({
	brandGroupList,
	//
	selectedCount,
	allSelected,
	anySelected,
	unselectedCartIdList,
	selectedCartIdList,
}: CartProductSectionProps) {
	const queryClient = useQueryClient();
	const { openModal, modalResult, clearModalResult } = useModalStore();

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
																<SmartImage src={product.filePath} alt={product.fileName} fill={true} />

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
																clickHandler={() => {
																	console.log(12321232132);
																	queryClient.invalidateQueries({ queryKey: ["cartList"] });
																}}
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
														<button onClick={() => openOptionChangeModal(product)}>옵션 변경</button>
														<button>쿠폰 사용</button>
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
	);
}
