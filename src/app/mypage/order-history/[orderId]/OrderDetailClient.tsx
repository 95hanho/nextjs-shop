"use client";

import { useQuery } from "@tanstack/react-query";
import styles from "./OrderDetail.module.scss";
import { getNormal } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";
import { MyOrderDetailResponse } from "@/types/mypage";

export default function OrderDetailClient({ orderId }: { orderId: string }) {
	const { loginOn } = useAuth();

	// =================================================================
	// React Query
	// =================================================================

	const { data: orderDetailData } = useQuery<MyOrderDetailResponse>({
		queryKey: ["orderDetail", orderId],
		queryFn: async () => getNormal(getApiUrl(API_URL.MY_ORDER_DETAIL), { orderId: Number(orderId) }),
		enabled: loginOn,
		refetchOnWindowFocus: false,
		// retry: false,
	});

	// =================================================================
	// useEffect, useMemo
	// =================================================================

	const { myOrderDetail, myOrderDetailItems } = useMemo(() => {
		if (!orderDetailData)
			return {
				myOrderDetail: null,
				myOrderDetailItems: [],
			};

		const result = {
			myOrderDetail: orderDetailData?.myOrderDetail,
			myOrderDetailItems: orderDetailData?.myOrderDetailItems,
		};
		console.log("result", result);
		return result;
	}, [orderDetailData]);

	return (
		<div className={styles.orderDetail}>
			{/* 전체 래퍼 */}
			<div className={styles.orderDetailWrap}>
				{/* 헤더: 타이틀 + 검색 + 메뉴 */}
				<header className={styles.orderDetailHeader}>
					<h2 className={styles.orderDetailTitle}>주문 상세보기</h2>
				</header>
				{/* 상세정보 */}
				<section className={styles.orderDetailList}>
					{/* 주문상품/적용 쿠폰 정보 */}
					<article>
						<h2>주문상품 / 적용 쿠폰 정보</h2>
					</article>
					{/* 배송지 정보 */}
					<article>
						<h2>배송지 정보</h2>
					</article>
					{/* 결제정보 */}
					<article>
						<h2>결제정보</h2>
					</article>
				</section>
			</div>
		</div>
	);
}
