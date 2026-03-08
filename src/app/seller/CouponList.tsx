"use client";

import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { GetSellerCouponListResponse, SellerCoupon } from "@/types/seller";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function CouponList() {
	const { loginOn } = useSellerAuth();

	// ------------------------------------------------
	// React Query
	// ------------------------------------------------

	// 판매자 쿠폰 리스트 조회
	const {
		data: sellerCouponList = [],
		isLoading: isCouponLoading,
		// isFetching,
	} = useQuery<GetSellerCouponListResponse, Error, SellerCoupon[]>({
		queryKey: ["sellerCouponList"],
		queryFn: () => getNormal(getApiUrl(API_URL.SELLER_COUPON)),
		select: (data) => {
			return data.couponList;
		},
		enabled: loginOn,
		refetchOnWindowFocus: false,
	});

	// ------------------------------------------------
	// React
	// ------------------------------------------------

	useEffect(() => {
		if (sellerCouponList.length > 0) {
			console.log("sellerCouponList", sellerCouponList);
		}
	}, [sellerCouponList]);

	return (
		<div id="sellerCouponList">
			<h2>쿠폰 목록</h2>
			<div>
				<table>
					<thead>
						<tr>
							<th></th>
						</tr>
					</thead>
					<tbody>{!isCouponLoading && <></>}</tbody>
				</table>
			</div>
		</div>
	);
}
