"use client";

import { CartItem, GetCartResponse } from "@/types/mypage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API_URL from "@/api/endpoints";
import { getApiUrl } from "@/lib/getBaseUrl";
import useAuth from "@/hooks/useAuth";
import { IoIosArrowDown, IoIosArrowUp, IoIosClose } from "react-icons/io";
import { BsExclamationCircle } from "react-icons/bs";
import { getNormal, postJson, putJson } from "@/api/fetchFilter";
import { money } from "@/lib/format";
import ImageFill from "@/components/common/ImageFill";
import CartWishButton from "./CartWishButton";
import { BaseResponse } from "@/types/common";
import React from "react";
import LodingWrap from "@/components/common/LodingWrap";
import { useModalStore } from "@/store/modalStore";

export default function CartClient() {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const openModal = useModalStore((state) => state.openModal);

	// 장바구니 리스트 조회
	// invalidateQueries(["cartList"])
	const {
		data: brandGroupList,
		isLoading,
		isFetching,
	} = useQuery<[string, CartItem[]][]>({
		queryKey: ["cartList", user?.userId],
		queryFn: async () => {
			const cartResponse: GetCartResponse = await getNormal(getApiUrl(API_URL.MY_CART));
			const brandGroup: Record<string, CartItem[]> = {};
			cartResponse.cartList.map((cart) => {
				// 브랜드별 그룹을 묶기
				if (!brandGroup[cart.sellerName]) brandGroup[cart.sellerName] = [];
				brandGroup[cart.sellerName].push(cart);
			});
			return Object.entries(brandGroup);
		},
		enabled: !!user?.userId,
	});
	// 장바구니 제품 수량 변경
	const handleChangeQuantity = useMutation<BaseResponse, Error, { quantity: number; cartId: number }>({
		mutationFn: ({ quantity, cartId }) => postJson<BaseResponse>(getApiUrl(API_URL.MY_CART), { quantity, cartId }),
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
	const handleChangeSelected = useMutation<BaseResponse, Error, { cartIdList: number[]; selected: boolean }>({
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

	/*  */
	const openOptionChangeModal = (product: CartItem) => {
		openModal("PRODUCTOPTION", {
			product,
		});
	};

	return (
		<main id="cart" className="cart">
			<div className="cart-frame">
				<h1 className="cart__title">장바구니</h1>
				<div className="cart-wrap">
					{(isLoading || isFetching) && <LodingWrap />}

					{/* 2열 레이아웃 컨테이너 (grid는 CSS에서) */}
					{/* 좌측: 상품 영역 */}
					<section className="product-wrap" aria-label="상품 영역">
						<div className="product-outline">
							{/* 상단 툴바 */}
							<div className="product-toolbar">
								<label className="product-toolbar__select" htmlFor="selectAll">
									<input id="selectAll" type="checkbox" className="checkbox checkbox--lg" />
									<span>전체 선택</span>
								</label>
								<button className="btn btn--text" data-action="removeSelected">
									선택 삭제
								</button>
							</div>

							<hr className="product-outline__divider" />

							{/* 브랜드 그룹 */}
							{brandGroupList?.map((brandGroup, brandGroupIdx) => {
								const brandName = brandGroup[0];
								const productList = brandGroup[1];

								return (
									<React.Fragment key={"cartBrand-" + brandName}>
										{brandGroupIdx > 0 && <hr className="product-brand__divider" />}
										<article className="brand-group" aria-labelledby="brand-denmade">
											<h2 className="brand-group__header">
												<span className="brand-group-left">
													<span className="brand-group__check">
														<input id="group-denmade" type="checkbox" className="checkbox" />
													</span>
													<label className="brand-group__title" id="brand-denmade" htmlFor="group-denmade">
														{brandName}
													</label>
												</span>

												<a href="#" className="brand-group__link">
													브랜드숍
												</a>
											</h2>

											{/* 상품 리스트 */}
											<ul className="product-list">
												{/* 상품 하나 */}
												{productList.map((product, productIdx) => {
													// console.log("productId", product.productId);
													let selectDisabled = product.stock < product.quantity;
													let productAlert = "";
													if (product.stock !== 0 && selectDisabled) {
														productAlert = "재고가 부족합니다. 옵션을 변경하시면 선택이 가능합니다.";
													}
													return (
														<li key={"cartBrandItem-" + product.cartId} className="product-item" data-sku="DEN0861">
															{/* 상품 체크 */}
															<div className="product-item__check">
																<input
																	id="item-DEN0861"
																	type="checkbox"
																	className="checkbox"
																	checked={product.selected}
																	disabled={selectDisabled}
																	onChange={async () => {
																		// console.log(112331);
																		await handleChangeSelected.mutateAsync({
																			cartIdList: [product.cartId],
																			selected: !product.selected,
																		});
																		queryClient.invalidateQueries({ queryKey: ["cartList"] });
																	}}
																/>
															</div>
															<div className="product-item__section">
																<div className="product-item__overview">
																	<div className="product-item__media">
																		<a href="" className="product-item__thumb">
																			<ImageFill src={product.filePath} alt={product.fileName} />
																			{selectDisabled && (
																				<div className="product-outofstock__cover">
																					<span className="product-outofstock__sticker">
																						{product.stock === 0 && "품절"}
																						{product.stock !== 0 && selectDisabled && "재고부족"}
																					</span>
																				</div>
																			)}
																		</a>
																		<CartWishButton product={product} />
																	</div>
																	<div className="product-item__content">
																		<div className="product-item__info">
																			<a href="" className="product-item__name">
																				{product.productName}
																			</a>
																			<p className="product-item__option">
																				{product.size} / {product.quantity}개
																			</p>
																			{/* 10개 이하 시에 표시 */}
																			{product.stock < 10 && (
																				<div className="product-item__warning">
																					<span>품절임박 {product.stock}개 남음</span>
																				</div>
																			)}
																			<div className="product-item__prices">
																				<h5 className="price price--sale">
																					<del>129,000원</del>
																				</h5>
																				<h5 className="price price--origin">
																					<span>{money(product.price)}원</span>
																				</h5>
																			</div>
																		</div>
																	</div>
																</div>
																{productAlert && <p className="product-alert">* {productAlert}</p>}

																<h5 className="product-item__delivery">
																	<b>10.02(목) 도착 예정</b>
																	<span>
																		<BsExclamationCircle />
																	</span>
																</h5>
																<div className="product-item__actions">
																	<button className="btn btn--ghost" onClick={() => openOptionChangeModal(product)}>
																		옵션 변경
																	</button>
																	<button className="btn btn--ghost">쿠폰 사용</button>
																</div>
															</div>
															<div className="product-item__delete">
																<button>
																	<IoIosClose />
																</button>
															</div>
														</li>
														/* ...다른 상품 li 반복 */
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
					<aside className="price-wrap" aria-label="주문 요약">
						<div className="price-outline summary-card">
							<div className="price-count summary-card__section">
								<div className="title summary-card__title">구매금액</div>

								<div className="price-line">
									<div className="info-name">상품 금액</div>
									<div className="price-num" data-field="subtotal">
										185,000원
									</div>
								</div>
								<div className="price-line">
									<div>할인 금액</div>
									<div className="text-blue-700">-39,960원</div>
								</div>
								<div className="price-line">
									<div>배송비</div>
									<div className="text-blue-700">무료배송</div>
								</div>
								<div className="price-line price-line--total font-bold mt-4">
									<div>총 구매 금액</div>
									<div aria-live="polite">
										<span className="summary__badge align-baseline mr-2 text-red-500">22%</span>
										<span className="align-baseline" data-field="total">
											145,040원
										</span>
									</div>
								</div>
								<div className="price-line">
									<div>적립혜택 예상</div>
									<div>최대 5,120</div>
								</div>
							</div>

							<hr className="summary-card__divider" />

							<div className="price-benefit benefit" aria-label="결제 혜택">
								<div className="title benefit__header">
									<div className="benefit__title">결제 혜택</div>
									<div className="benefit__more text-sm">
										<a href="#" className="text-gray-600 underline">
											더보기
										</a>
									</div>
								</div>
								<div className="benefit__body">
									<h3 className="benefit__subtitle">즉시 할인</h3>
									<div className="benefit__item kakaopay">
										<i className="benefit__icon">
											<img src="/images/kakaopay-seeklogo.png" alt="카카오페이이미지" />
										</i>
										<span className="benefit__text">
											카카오페이 × 페이머니 <span>8만원 이상 결제 시 4천원 즉시 할인</span>
										</span>
									</div>
									<div className="benefit__item samsungpay">
										<i className="benefit__icon">
											<img src="/images/Samsung Pay_2025_hor_rev_RGB.png" alt="삼성페이이미지" />
										</i>
										<span className="benefit__text">
											삼성페이 x 삼성카드 <span>3만원 이상 결제시 3천원 즉시 할인</span>
										</span>
									</div>
									<div className="benefit__item">
										<i className="benefit__icon">
											<img src="/images/btn_Vertical-cr_napygr.svg" alt="네이버페이이미지" />
										</i>
										<span className="benefit__text">
											네이버페이 x 신한카드 <span>2만원 이상 결제시 2천원 즉시 할인</span>
										</span>
									</div>
								</div>
							</div>

							<hr className="summary-card__divider" />

							<div className="summary-card__notice">
								<button className="notice__toggle" type="button">
									유의사항 {true ? <IoIosArrowDown /> : <IoIosArrowUp />}
								</button>
							</div>
						</div>
						<div className="notice-wrap">
							<ul className="notice-list">
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
						<div className="summary-card__cta">
							<button className="btn btn--primary btn--xl">145,040원 구매하기 (1개)</button>
						</div>
					</aside>
				</div>
			</div>
		</main>
	);
}
