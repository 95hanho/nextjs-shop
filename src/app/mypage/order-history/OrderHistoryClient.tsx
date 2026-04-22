"use client";

import { FaSearch } from "react-icons/fa";
import styles from "./OrderHistory.module.scss";
import { useQuery } from "@tanstack/react-query";
import { MyOrderListResponse } from "@/types/mypage";
import API_URL from "@/api/endpoints";
import { getApiUrl } from "@/lib/getBaseUrl";
import { getNormal } from "@/api/fetchFilter";
import { useAuth } from "@/hooks/useAuth";
import { LodingWrap } from "@/components/common/LodingWrap";
import { useMemo, useState } from "react";
import moment from "moment/moment";
import "moment/locale/ko"; // 한국어 로케일 추가
import { getOrderStatusLabel } from "@/lib/order";
import { money } from "@/lib/format";
import { SmartImage } from "@/components/ui/SmartImage";
import Link from "next/link";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import { getUploadImageUrl } from "@/lib/image";

export default function OrderHistoryClient() {
	const { loginOn } = useAuth();
	const { openDialog } = useGlobalDialogStore();

	// =================================================================
	// React Query
	// =================================================================

	const [searchText, setSearchText] = useState(""); // 검색 텍스트
	// React Query 쓰면 주문내역 수정(추가/삭제) 후 invalidateQueries(["orderHistory"])로 새로고침 처리 가능.
	// 주문내역 조회
	const {
		data: orderHistoryData,
		isLoading,
		isFetching,
	} = useQuery<MyOrderListResponse>({
		queryKey: ["orderHistory", searchText],
		queryFn: async () => {
			const payload = {} as { keyword?: string };
			if (searchText) payload.keyword = searchText;
			return await getNormal(getApiUrl(API_URL.MY_ORDER), {
				...payload,
			});
		},
		enabled: loginOn,
		refetchOnWindowFocus: false,
	});

	// =================================================================
	// React
	// =================================================================

	// 검색 입력값
	const [inputValue, setInputValue] = useState("");

	// 검색어 하이라이트 함수
	const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	/** 텍스트에서 키워드를 하이라이트하는 함수 */
	const highlightText = (text: string, keyword: string) => {
		if (!keyword) return text;

		const escaped = escapeRegExp(keyword);
		const parts = text.split(new RegExp(`(${escaped})`, "gi"));

		return parts.map((part, index) => (part.toLowerCase() === keyword.toLowerCase() ? <mark key={index}>{part}</mark> : part));
	};

	// =================================================================
	// useEffect, useMemo
	// =================================================================

	const { myOrderList } = useMemo(() => {
		if (!orderHistoryData)
			return {
				myOrderList: [],
			};

		const result = {
			myOrderList: orderHistoryData.myOrderList,
		};
		console.log("주문내역 데이터", result);
		return result;
	}, [orderHistoryData]);

	return (
		<div className={styles.orderHistory}>
			{/* 전체 래퍼 */}
			<div className={styles.orderHistoryWrap}>
				{/* 헤더: 타이틀 + 검색 + 메뉴 */}
				<header className={styles.orderHistoryHeader}>
					<h2 className={styles.orderHistoryTitle}>주문내역</h2>

					{/* 검색창 */}
					<div className={styles.orderHistorySearch}>
						<input
							type="text"
							className={styles.orderHistorySearchInput}
							placeholder="상품명/브랜드명으로 검색하세요."
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyUp={(e) => {
								if (e.key == "Enter") {
									setSearchText(inputValue);
								}
							}}
						/>
						<button className={styles.orderHistorySearchBtn} onClick={() => setSearchText(inputValue)}>
							<FaSearch />
						</button>
					</div>

					{/* 메뉴 탭 */}
					{/* <nav className={styles.orderHistoryNav}>
						<ul className={styles.orderHistoryNavList}>
							<li className={`${styles.orderHistoryNavItem} ${styles.isActive}`}>
								<a href="#">전체</a>
							</li>
							<li className={styles.orderHistoryNavItem}>
								<a href="#">오프라인 구매</a>
							</li>
							<li className={styles.orderHistoryNavItem}>
								<a href="#">상품권</a>
							</li>
							<li className={styles.orderHistoryNavItem}>
								<a href="#">티켓</a>
							</li>
							<li className={styles.orderHistoryNavItem}>
								<a href="#">픽업</a>
							</li>
						</ul>
					</nav> */}
				</header>

				{/* 주문 리스트 섹션 */}
				<section className={styles.orderHistoryList}>
					{(isLoading || isFetching) && <LodingWrap />}
					{!isLoading && (
						// 날짜별 주문 블록
						<>
							{myOrderList.length === 0 ? (
								<>
									<div className="px-3 mt-3 ">
										<h2>{searchText ? "검색된 주문 내역이 없습니다." : "주문 내역이 없습니다."}</h2>
									</div>
								</>
							) : (
								myOrderList.map((order) => (
									<article key={"myOrderItem-" + order.orderId} className={styles.orderHistoryGroup}>
										<h3 className={styles.orderHistoryDate}>
											{moment(order.orderDate).format("YY.MM.DD(ddd)")} {/* 날짜 포맷 예시 */}
											<Link href={`/mypage/order-history/${order.orderId}`} className={styles.orderHistoryDetailLink}>
												주문 상세
											</Link>
										</h3>

										<ul className={styles.orderHistoryItems}>
											{/* 주문 상품 아이템 */}
											{order.items.map((item) => {
												return (
													<li key={"orderItem-" + item.orderItemId} className={styles.orderHistoryItem}>
														<h5 className={styles.orderHistoryStatus}>{getOrderStatusLabel(item.status)}</h5>

														{/* 상품 정보 */}
														<div className={styles.orderHistoryProduct}>
															<Link href={`/product/detail/${item.productId}`} className={styles.orderHistoryThumb}>
																<SmartImage
																	fill
																	src={getUploadImageUrl(item.filePath)}
																	alt={item.productName + " 이미지"}
																/>
															</Link>

															<div className={styles.orderHistoryInfo}>
																<h4 className={styles.orderHistoryBrand}>
																	{highlightText(item.sellerName, searchText)}
																</h4>
																<p className={styles.orderHistoryName}>
																	<Link href={`/product/detail/${item.productId}`}>
																		{highlightText(item.productName, searchText)}
																	</Link>
																</p>
																<h5 className={styles.orderHistoryOption}>
																	{item.size}
																	{item.addPrice > 0 ? `(+${money(item.addPrice)})` : ""} / {item.count}개
																</h5>
																<h6 className={styles.orderHistoryPrice}>{money(item.finalPrice)}원</h6>
															</div>
														</div>

														{/* 버튼 */}
														<div className={styles.orderHistoryButtons}>
															<button
																className={styles.orderHistoryBtn}
																onClick={() => {
																	openDialog("ALERT", {
																		content: "배송 조회는 아직 구현되지 않았습니다.",
																	});
																}}
															>
																배송 조회
															</button>
															<Link
																href={
																	item.reviewId
																		? `/product/detail/${item.productId}?tab=review`
																		: `/mypage/review/${item.orderItemId}`
																}
																className={`${styles.orderHistoryBtn} ${styles.orderHistoryBtnGray}`}
															>
																{item.reviewId ? "작성 리뷰 보기" : "리뷰 작성"}
															</Link>
														</div>
													</li>
												);
											})}
										</ul>
									</article>
								))
							)}
						</>
					)}
				</section>
			</div>
		</div>
	);
}
