import { getGender } from "@/lib/format";
import moment from "moment";
import { Fragment, useEffect, useState } from "react";
import { FaCaretSquareDown, FaCaretSquareUp } from "react-icons/fa";
import styles from "./SellerMain.module.scss";
import { sellerProduct } from "@/types/seller";
import clsx from "clsx";

interface ProductListProps {
	sellerProductList: sellerProduct[];
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
	const couponAllowedMode = allowedSelectedCouponId !== null; // 쿠폰 허용 제품이 하나라도 있으면 true

	// ------------------------------------------------
	// React
	// ------------------------------------------------

	const [openProductId, setOpenProductId] = useState<number | null>(null);

	useEffect(() => {
		if (couponAllowedProductIds.length > 0) {
			console.log("쿠폰 허용 제품 ID 리스트:", couponAllowedProductIds);
		}
	}, [couponAllowedProductIds]);

	if (isCouponAllowedProductIdsLoading) return null;
	return (
		<div id="sellerProductList" className={styles.sellerProductList}>
			<h2>
				<span>상품 목록 - {allowedSelectedCouponId && <span className="text-red-600 underline">{`쿠폰 허용 제품 선택 중`}</span>}</span>

				{couponAllowedMode && <button onClick={() => updateCouponAllowedProducts(selectedProductIds)}>상품제한변경</button>}
			</h2>
			<div className={styles.productTableWrapper}>
				<table className={styles.productTable}>
					<thead>
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
												<td>{product.saleStop && "O"}</td>
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
													<td colSpan={11}>
														<div>
															<h4>옵션 목록</h4>
															<div className={styles.productOptionTable}>
																<table className="w-full">
																	<thead>
																		<tr>
																			<th>사이즈</th>
																			<th>추가금액</th>
																			<th>재고</th>
																			<th>판매량</th>
																			<th>숨김</th>
																		</tr>
																	</thead>
																	<tbody>
																		{product.optionList.map((option) => (
																			<tr key={option.productOptionId}>
																				<td>{option.size}</td>
																				<td>{option.addPrice}</td>
																				<td>{option.stock}</td>
																				<td>{option.salesCount}</td>
																				<td>{!option.displayed && "O"}</td>
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
