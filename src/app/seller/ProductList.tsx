import { getGender } from "@/lib/format";
import moment from "moment";
import { Fragment, useEffect, useRef, useState } from "react";
import { FaCaretSquareDown, FaCaretSquareUp, FaExchangeAlt } from "react-icons/fa";
import styles from "./SellerMain.module.scss";
import clsx from "clsx";
import { AddProductOptionBase, AddSellerProductOptionRequest, SellerProduct, UpdateSellerProductOptionRequest } from "@/types/seller";
import { useModalStore } from "@/store/modal.store";
import { DialogResultMap, DomainModalResultMap } from "@/store/modal.type";
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

export default function ProductList({
	sellerProductList,
	allowedSelectedCouponId,
	couponAllowedProductIds,
	updateCouponAllowedProducts,
	isCouponAllowedProductIdsLoading,
	selectedProductIds,
	changeSelectedProductIds,
	changeAllSelectedProductIds,
}: ProductListProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { openModal, clearModalResult, modalResult } = useModalStore();
	const { openDialog, dialogResult, clearDialogResult } = useGlobalDialogStore();
	const couponAllowedMode = allowedSelectedCouponId !== null; // 쿠폰 허용 제품이 하나라도 있으면 true

	// ------------------------------------------------
	// React Query
	// ------------------------------------------------

	// 제품 수정
	const { mutate: updateSellerProduct, isSuccess: isUpdateSellerProductSuccess, reset: resetUpdateSellerProduct } = useSellerProductUpdate();
	// 제품 옵션 추가
	const { mutate: addProductOption } = useMutation({
		mutationFn: (optionForm: AddProductOptionBase) =>
			postJson<BaseResponse, AddSellerProductOptionRequest>(getApiUrl(API_URL.SELLER_PRODUCT_OPTION), {
				...optionForm,
				productId: productIdForOptionRef.current!,
			}),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ["sellerProductList"] });
		},
	});
	// 제품 옵션 수정
	const { mutate: updateProductOption } = useMutation({
		mutationFn: (optionForm: UpdateSellerProductOptionRequest) => putJson(getApiUrl(API_URL.SELLER_PRODUCT_OPTION), { ...optionForm }),
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

	// ------------------------------------------------
	// React
	// ------------------------------------------------

	const [openProductId, setOpenProductId] = useState<number | null>(null);
	const theadRef = useRef<HTMLTableSectionElement | null>(null); // 제품 thead th 갯수를 세기 위한 ref
	// 제품 옵션 추가/수정 시 productId 보관 ref
	const productIdForOptionRef = useRef<number | null>(null);
	// 제품 판매중단 상태 변경용 제품 저장
	const [changingSaleStopProduct, setChangingSaleStopProduct] = useState<SellerProduct | null>(null);

	// ------------------------------------------------
	// useEffect, useMemo
	// ------------------------------------------------

	useEffect(() => {
		if (couponAllowedProductIds.length > 0) {
			// console.log("쿠폰 허용 제품 ID 리스트:", couponAllowedProductIds);
		}
		if (sellerProductList.length > 0) {
			console.log("판매자 제품 목록:", sellerProductList);
		}
	}, [couponAllowedProductIds, sellerProductList]);

	// 제품 수정 성공 시 제품 목록 리패치
	useEffect(() => {
		if (!isUpdateSellerProductSuccess) return;

		queryClient.invalidateQueries({ queryKey: ["sellerProductList"] });
		resetUpdateSellerProduct();
	}, [isUpdateSellerProductSuccess, queryClient, resetUpdateSellerProduct]);

	// 모달 동작
	useEffect(() => {
		if (!dialogResult) return;

		if (dialogResult.action === "CONFIRM_OK") {
			const payload = dialogResult.payload as DialogResultMap["CONFIRM_OK"];
			if (payload?.result === "SALE_STOP_CONFIRM" && changingSaleStopProduct) {
				updateSellerProduct({
					productId: changingSaleStopProduct.productId,
					name: changingSaleStopProduct.name,
					colorName: changingSaleStopProduct.colorName,
					originPrice: changingSaleStopProduct.originPrice,
					finalPrice: changingSaleStopProduct.finalPrice,
					menuSubId: changingSaleStopProduct.menuSubId,
					materialInfo: changingSaleStopProduct.materialInfo || "",
					manufacturerName: changingSaleStopProduct.manufacturerName || "",
					countryOfOrigin: changingSaleStopProduct.countryOfOrigin || "",
					washCareInfo: changingSaleStopProduct.washCareInfo || "",
					manufacturedYm: changingSaleStopProduct.manufacturedYm || "",
					qualityGuaranteeInfo: changingSaleStopProduct.qualityGuaranteeInfo || "",
					afterServiceContact: changingSaleStopProduct.afterServiceContact || "",
					afterServiceManager: changingSaleStopProduct.afterServiceManager || "",
					afterServicePhone: changingSaleStopProduct.afterServicePhone || "",
					saleStop: !changingSaleStopProduct?.saleStop,
					imageUpdate: false, // 판매중단 상태 변경은 이미지 변경과 무관하므로 false
				});
			}
		}

		clearDialogResult();
	}, [changingSaleStopProduct, clearDialogResult, dialogResult, updateSellerProduct]);
	useEffect(() => {
		if (!modalResult) return;

		// 제품 옵션 추가/수정 후 처리
		if (modalResult.action === "SELLER_PRODUCT_OPTION_SET") {
			const payload = modalResult.payload as DomainModalResultMap["SELLER_PRODUCT_OPTION_SET"];
			console.log("제품 옵션 추가/수정 결과 처리", { payload });
			if ("addProductOption" in payload) {
				addProductOption(payload.addProductOption);
			} else if ("updateProductOption" in payload) {
				updateProductOption(payload.updateProductOption);
			}
		}
		// 제품 옵션 삭제 후 처리
		if (modalResult.action === "SELLER_PRODUCT_OPTION_DELETE") {
			const { productOptionId } = modalResult.payload as DomainModalResultMap["SELLER_PRODUCT_OPTION_DELETE"];
			console.log("제품 옵션 삭제 결과 처리", { productOptionId });
			deleteProductOption(productOptionId);
		}

		// 모달 닫힐 시 옵션 변경 취소 처리
		if (modalResult.action === "DOMAIN_CLOSE") {
			const payload = modalResult.payload as DomainModalResultMap["DOMAIN_CLOSE"];
			if (payload?.result === "SELLER_PRODUCT_OPTION_SET_CANCEL") {
				productIdForOptionRef.current = null;
			}
		}

		clearModalResult();
	}, [modalResult, addProductOption, updateProductOption, deleteProductOption, clearModalResult]);

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
															setChangingSaleStopProduct(product);
															openDialog("CONFIRM", {
																content: "상품의 판매 상태를 변경하시겠습니까?",
																okResult: "SALE_STOP_CONFIRM",
																handleAfterClose() {
																	setChangingSaleStopProduct(null);
																},
															});
														}}
													>
														{product.saleStop && "중단됨"}
														<FaExchangeAlt />
													</button>
												</td>
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
																<button
																	className={styles.addButton}
																	onClick={() => {
																		productIdForOptionRef.current = product.productId;
																		openModal("SELLER_PRODUCT_OPTION", {
																			productOptionSizeDuplicateList: product.optionList.map((opt) => opt.size),
																			disableOverlayClose: true,
																			closeResult: "SELLER_PRODUCT_OPTION_SET_CANCEL",
																		});
																	}}
																>
																	옵션 추가
																</button>
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
																					productIdForOptionRef.current = product.productId;
																					openModal("SELLER_PRODUCT_OPTION", {
																						prevSellerProductOption: option,
																						productOptionSizeDuplicateList: product.optionList.map(
																							(opt) => opt.size,
																						),
																						disableOverlayClose: true,
																						closeResult: "SELLER_PRODUCT_OPTION_SET_CANCEL",
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
																								productOptionId: option.productOptionId,
																								addPrice: option.addPrice,
																								stock: option.stock,
																								isDisplayed: !option.displayed,
																								size: option.size,
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
