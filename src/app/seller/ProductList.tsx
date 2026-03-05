"use client";

import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { getGender } from "@/lib/format";
import { getApiUrl } from "@/lib/getBaseUrl";
import { GetSellerProductListResponse, sellerProduct } from "@/types/seller";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useState } from "react";
import { BsFillSignStopFill } from "react-icons/bs";
import { FaCaretSquareDown } from "react-icons/fa";

export default function ProductList() {
	const { loginOn } = useSellerAuth();

	// ------------------------------------------------
	// React Query
	// ------------------------------------------------

	// 판매자 제품 리스트 조회
	// invalidateQueries(["cartList"])
	const {
		data: sellerProductList = [],
		isLoading,
		// isFetching,
	} = useQuery<GetSellerProductListResponse, Error, sellerProduct[]>({
		queryKey: ["sellerProductList"],
		queryFn: async () => await getNormal(getApiUrl(API_URL.SELLER_PRODUCT)),
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

	return (
		<div>
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
						{!isLoading && (
							<>
								{sellerProductList.length > 0 &&
									sellerProductList.map((product) => (
										<>
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
															<div>
																<table>
																	<thead>
																		<tr>
																			<th>사이즈</th>
																			<th>추가금액</th>
																			<th>재고</th>
																			<th></th>
																		</tr>
																	</thead>
																	<tbody></tbody>
																</table>
															</div>
														</div>
													</td>
												</tr>
											)}
										</>
									))}
							</>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
