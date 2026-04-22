import { getGender } from "@/lib/format";
import moment from "moment";
import { Fragment, useEffect, useRef, useState } from "react";
import { FaCaretSquareDown, FaCaretSquareUp, FaExchangeAlt } from "react-icons/fa";
import styles from "./SellerMain.module.scss";
import clsx from "clsx";
import { AddProductOptionBase, AddSellerProductOptionRequest, SellerProduct, UpdateSellerProductOptionRequest } from "@/types/seller";
import { useModalStore } from "@/store/modal.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNormal, postJson, putJson } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { BaseResponse } from "@/types/common";
import { useSellerProductUpdate } from "@/hooks/query/seller/useSellerProductUpdate";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProductListProps {
	sellerProductList: SellerProduct[];
	allowedSelectedCouponId: number | null; // 현재 쿠폰 허용 제품 조회에 사용 중인 쿠폰 ID (null이면 조회 모드 아님)
	couponAllowedProductIds: number[]; // 쿠폰 허용 제품 ID 리스트
	updateCouponAllowedProducts: (productIds: number[]) => void; // 쿠폰 허용 제품 업데이트 함수 (선택적으로 전달)
	isCouponAllowedProductIdsLoading: boolean; // 쿠폰 허용 제품 ID 조회 로딩 상태
	selectedProductIds: number[]; // 현재 선택된 제품 ID 리스트
	changeSelectedProductIds: (productId: number) => void; // 선택된 제품 ID 리스트 변경 함수
	changeAllSelectedProductIds: (isChecked: boolean) => void; // 모든 제품 선택/해제 함수
}

export default function SellerProductList({
	sellerProductList,
	allowedSelectedCouponId,
	couponAllowedProductIds,
	updateCouponAllowedProducts,
	isCouponAllowedProductIdsLoading,
	selectedProductIds,
	changeSelectedProductIds,
	changeAllSelectedProductIds,
}: ProductListProps) {
	// 1) [store / custom hooks] -------------------------------------------
	const router = useRouter();
	const queryClient = useQueryClient();
	const { openModal } = useModalStore();
	const { openDialog } = useGlobalDialogStore();

	// 2) [useState / useRef] ----------------------------------------------
	const [openProductId, setOpenProductId] = useState<number | null>(null);
	const theadRef = useRef<HTMLTableSectionElement | null>(null); // 제품 thead th 갯수를 세기 위한 ref

	// 3) [useQuery / useMutation] -----------------------------------------
	// 제품 수정
	const { mutate: updateSellerProduct, isSuccess: isUpdateSellerProductSuccess, reset: resetUpdateSellerProduct } = useSellerProductUpdate();
	// 제품 옵션 추가
	const { mutate: addProductOption } = useMutation({
		mutationFn: ({ optionForm, productId }: { optionForm: AddProductOptionBase; productId: number }) =>
			postJson<BaseResponse, AddSellerProductOptionRequest>(getApiUrl(API_URL.SELLER_PRODUCT_OPTION), {
				...optionForm,
				productId,
			}),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ["sellerProductList"] });
		},
	});
	// 제품 옵션 수정
	const { mutate: updateProductOption } = useMutation({
		mutationFn: ({ optionForm }: { optionForm: UpdateSellerProductOptionRequest }) =>
			putJson(getApiUrl(API_URL.SELLER_PRODUCT_OPTION), { ...optionForm }),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ["sellerProductList"] });
		},
	});
	// 제품 옵션 삭제
	const { mutate: deleteProductOption } = useMutation({
		mutationFn: (productOptionId: number) =>
			deleteNormal(getApiUrl(API_URL.SELLER_PRODUCT_OPTION_DELETE), {
				productOptionId,
			}),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ["sellerProductList"] });
		},
	});

	// 4) [derived values / useMemo] ---------------------------------------
	// 쿠폰 허용 제품이 하나라도 있으면 true
	const couponAllowedMode = allowedSelectedCouponId !== null;

	// 6) [useEffect] ------------------------------------------------------
	useEffect(() => {
		if (couponAllowedProductIds.length > 0) {
			// console.log("쿠폰 허용 제품 ID 리스트:", couponAllowedProductIds);
		}
		if (sellerProductList.length > 0) {
			// console.log("판매자 제품 목록:", sellerProductList);
		}
	}, [couponAllowedProductIds, sellerProductList]);
	// 제품 수정 성공 시 제품 목록 리패치
	useEffect(() => {
		if (!isUpdateSellerProductSuccess) return;

		queryClient.invalidateQueries({ queryKey: ["sellerProductList"] });
		resetUpdateSellerProduct();
	}, [isUpdateSellerProductSuccess, queryClient, resetUpdateSellerProduct]);

	if (isCouponAllowedProductIdsLoading) return null;
	return (
		<div id="sellerProductList" className={styles.sellerProductList}>
			<h2>
				<span>상품 목록{allowedSelectedCouponId && <span className="text-red-600 underline">{` - 쿠폰 허용 제품 선택 중`}</span>}</span>

				{!couponAllowedMode ? (
					<>
						<Link href="/seller/product" className={styles.addButton}>
							상품 추가
						</Link>
					</>
				) : (
					<button className={styles.changeButton} onClick={() => updateCouponAllowedProducts(selectedProductIds)}>
						상품제한변경
					</button>
				)}
			</h2>
			<div className={styles.productTableWrapper}>
				<table className={styles.productTable}>
					<thead ref={theadRef}>
						<tr>
							<th className={styles.checkboxCell}>
								<input
									type="checkbox"
									checked={selectedProductIds.length === sellerProductList.length}
									onChange={(e) => {
										changeAllSelectedProductIds(e.target.checked);
									}}
								/>
							</th>
							<th>productId</th>
							<th>상품명</th>
							<th>등록일</th>
							<th>수정일</th>
							<th>view</th>
							<th>like</th>
							<th>wish</th>
							<th>구분{/* 남-아우터-재킷 */}</th>
							<th>판매중단</th>
							<th>리뷰별점</th>
							<th>리뷰갯수</th>
							{!couponAllowedMode && <th>옵션</th>}
						</tr>
					</thead>
					<tbody>
						<>
							{sellerProductList.length > 0 &&
								sellerProductList.map((product) => {
									const isChecked = selectedProductIds.includes(product.productId);

									return (
										<Fragment key={product.productId}>
											<tr
												key={product.productId}
												className={clsx(
													styles.sellerListTr,
													isChecked && styles.selectedProductRow,
													couponAllowedProductIds.includes(product.productId) && styles.couponAllowedProductHighlight,
												)}
												onClick={() => {
													changeSelectedProductIds(product.productId);
												}}
												onDoubleClick={() => {
													router.push(`/seller/product/${product.productId}`);
												}}
											>
												<td className={styles.checkboxCell}>
													<input
														type="checkbox"
														checked={selectedProductIds.includes(product.productId)}
														onChange={() => {
															changeSelectedProductIds(product.productId);
														}}
													/>
												</td>
												<td>{product.productId}</td>
												<td>{product.name}</td>
												<td>{moment(product.createdAt).format("YYYY-MM-DD")}</td>
												<td>{moment(product.updatedAt).format("YYYY-MM-DD HH:mm")}</td>
												<td>{product.viewCount}</td>
												<td>{product.likeCount}</td>
												<td>{product.wishCount}</td>
												<td>{`${getGender(product.gender)}-${product.topMenuName}-${product.subMenuName}`}</td>
												<td>
													<button
														className={clsx(styles.saleStopButton, product.saleStop ? styles.on : styles.off)}
														onClick={(e) => {
															e.stopPropagation();
															openDialog("CONFIRM", {
																content: "상품의 판매 상태를 변경하시겠습니까?",
																handleAfterOk: () => {
																	updateSellerProduct({
																		productId: product.productId,
																		name: product.name,
																		colorName: product.colorName,
																		originPrice: product.originPrice,
																		finalPrice: product.finalPrice,
																		menuSubId: product.menuSubId,
																		materialInfo: product.materialInfo || "",
																		manufacturerName: product.manufacturerName || "",
																		countryOfOrigin: product.countryOfOrigin || "",
																		washCareInfo: product.washCareInfo || "",
																		manufacturedYm: product.manufacturedYm || "",
																		qualityGuaranteeInfo: product.qualityGuaranteeInfo || "",
																		afterServiceContact: product.afterServiceContact || "",
																		afterServiceManager: product.afterServiceManager || "",
																		afterServicePhone: product.afterServicePhone || "",
																		saleStop: !product?.saleStop,
																		imageUpdate: false, // 판매중단 상태 변경은 이미지 변경과 무관하므로 false
																	});
																},
															});
														}}
													>
														{product.saleStop && "중단됨"}
														<FaExchangeAlt />
													</button>
												</td>
												<td>{product.reviewCount > 0 && product.avgRating}</td>
												<td>{product.reviewCount > 0 && product.reviewCount}</td>
												{!couponAllowedMode && (
													<td>
														<button
															onClick={(e) => {
																e.stopPropagation(); // 행 클릭 이벤트와 중복 방지
																setOpenProductId(openProductId === product.productId ? null : product.productId);
															}}
														>
															{openProductId === product.productId ? <FaCaretSquareUp /> : <FaCaretSquareDown />}
														</button>
													</td>
												)}
											</tr>
											{openProductId === product.productId && (
												<tr>
													<td colSpan={theadRef?.current?.children[0]?.children.length || 10}>
														<div className={styles.productOptionContainer}>
															<h4>
																<span>옵션 목록</span>
																{product.optionList.length < 6 && (
																	<button
																		className={styles.addButton}
																		onClick={() => {
																			openModal("SELLER_PRODUCT_OPTION", {
																				productOptionSizeDuplicateList: product.optionList.map(
																					(opt) => opt.size,
																				),
																				disableOverlayClose: true,
																				handleAfterAddSellerProductOption: (productOption) => {
																					addProductOption({
																						optionForm: productOption,
																						productId: product.productId,
																					});
																				},
																			});
																		}}
																	>
																		옵션 추가
																	</button>
																)}
															</h4>
															<div className={styles.productOptionTable}>
																<table className="w-full">
																	<thead>
																		<tr>
																			<th>productOptionId</th>
																			<th>사이즈</th>
																			<th>추가금액</th>
																			<th>재고</th>
																			<th>판매량</th>
																			<th>숨김여부</th>
																		</tr>
																	</thead>
																	<tbody>
																		{product.optionList.map((option) => (
																			<tr
																				key={option.productOptionId}
																				className={styles.productOptionRow}
																				onClick={() => {
																					openModal("SELLER_PRODUCT_OPTION", {
																						prevSellerProductOption: option,
																						productOptionSizeDuplicateList: product.optionList.map(
																							(opt) => opt.size,
																						),
																						disableOverlayClose: true,
																						handleAfterUpdateSellerProductOption: (productOption) => {
																							updateProductOption({ optionForm: productOption });
																						},
																						handleAfterDeleteSellerProductOption: (productOptionId) => {
																							deleteProductOption(productOptionId);
																						},
																					});
																				}}
																			>
																				<td>{option.productOptionId}</td>
																				<td>{option.size}</td>
																				<td>{option.addPrice}</td>
																				<td>{option.stock}</td>
																				<td>{option.salesCount}</td>
																				<td>
																					<button
																						className={clsx(
																							styles.displayedButton,
																							option.displayed ? styles.on : styles.off,
																						)}
																						onClick={(e) => {
																							e.stopPropagation();
																							updateProductOption({
																								optionForm: {
																									productOptionId: option.productOptionId,
																									addPrice: option.addPrice,
																									stock: option.stock,
																									isDisplayed: !option.displayed,
																									size: option.size,
																								},
																							});
																						}}
																					>
																						{option.displayed ? "X" : "숨겨짐"}
																						<FaExchangeAlt />
																					</button>
																				</td>
																			</tr>
																		))}
																	</tbody>
																</table>
															</div>
														</div>
													</td>
												</tr>
											)}
										</Fragment>
									);
								})}
						</>
					</tbody>
				</table>
			</div>
		</div>
	);
}
