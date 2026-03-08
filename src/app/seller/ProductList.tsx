"use client";

import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { getGender } from "@/lib/format";
import { getApiUrl } from "@/lib/getBaseUrl";
import { GetSellerProductListResponse, sellerProduct } from "@/types/seller";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { FaCaretSquareDown } from "react-icons/fa";
import styles from "./ProductList.module.scss";

export default function ProductList() {
	const { loginOn } = useSellerAuth();

	// ------------------------------------------------
	// React Query
	// ------------------------------------------------

	// 판매자 제품 리스트 조회
	// invalidateQueries(["cartList"])
	const {
		data: sellerProductList = [],
		isLoading: isProductLoading,
		// isFetching,
	} = useQuery<GetSellerProductListResponse, Error, sellerProduct[]>({
		queryKey: ["sellerProductList"],
		queryFn: () => getNormal(getApiUrl(API_URL.SELLER_PRODUCT)),
		select: (data) => {
			return data.sellerProductList;
		},

		enabled: loginOn,
		refetchOnWindowFocus: false,
	});

	// ------------------------------------------------
	// React
	// ------------------------------------------------

	const [openProductId, setOpenProductId] = useState<number | null>(null);

	useEffect(() => {
		if (sellerProductList.length > 0) {
			// console.log("sellerProductList", sellerProductList);
		}
	}, [sellerProductList]);

	return (
		<div id="sellerProductList">
			<h2>상품 목록</h2>
			<div>
				<table>
					<thead>
						<tr>
							<th>상품명</th>
							<th>등록일</th>
							<th>수정일</th>
							<th>view</th>
							<th>like</th>
							<th>wish</th>
							<th>구분{/* 남-아우터-재킷 */}</th>
							<th>판매중단</th>
							<th>옵션</th>
						</tr>
					</thead>
					<tbody>
						{!isProductLoading && (
							<>
								{sellerProductList.length > 0 &&
									sellerProductList.map((product) => (
										<React.Fragment key={product.productId}>
											<tr key={product.productId}>
												<td>{product.name}</td>
												<td>{moment(product.createdAt).format("YYYY-MM-DD")}</td>
												<td>{moment(product.updatedAt).format("YYYY-MM-DD HH:mm")}</td>
												<td>{product.viewCount}</td>
												<td>{product.likeCount}</td>
												<td>{product.wishCount}</td>
												<td>{`${getGender(product.gender)}-${product.topMenuName}-${product.subMenuName}`}</td>
												<td>{product.saleStop && "O"}</td>
												<td>
													<button
														onClick={() =>
															setOpenProductId(openProductId === product.productId ? null : product.productId)
														}
													>
														<FaCaretSquareDown />
													</button>
												</td>
											</tr>
											{openProductId === product.productId && (
												<tr>
													<td colSpan={10}>
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
										</React.Fragment>
									))}
							</>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
