"use client";

import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { GetSellerCouponListResponse, SellerCoupon } from "@/types/seller";
import { useQuery } from "@tanstack/react-query";

import styles from "./SellerCouponDistribution.module.scss";
import { useState } from "react";
import clsx from "clsx";
import moment from "moment";
import { money } from "@/lib/format";

export default function SellerCouponDistributionClient() {
	const { loginOn } = useSellerAuth();

	// ------------------------------------------------
	// React Query
	// ------------------------------------------------

	// 판매자 쿠폰 리스트 조회
	const {
		data: sellerCouponList = [],
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
	// 선택된 쿠폰
	const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);

	return (
		<div className={styles.sellerCouponDistribution}>
			<div id="couponDistribution" className={styles.couponDistribution}>
				<h2>쿠폰 배포</h2>
				<section className={clsx(styles.couponDistributionInfo, { [styles.disabled]: !selectedCouponId })}>
					<div>
						<button>내 상품을 본 회원({money(100)}명)에게 배포</button>
					</div>
					<div>
						<button>내 상품을 즐겨찾기한 회원({money(50)}명)에게 배포</button>
					</div>
					<div>
						<button>내 상품을 장바구니에 넣은 회원({money(30)}명)에게 배포</button>
					</div>
					<div>
						<button>내 상품을 구매한 회원({money(20)}명)에게 배포</button>
					</div>
				</section>
			</div>
			<div id="sellerCouponSelect" className={styles.sellerCouponSelect}>
				<h2>쿠폰 선택</h2>
				<div className={styles.couponTableWrapper}>
					<table className={styles.couponTable}>
						<thead>
							<tr>
								<th className={styles.checkboxCell}></th>
								<th>couponId</th>
								<th>설명</th>
								<th>타입</th>
								<th>할인값</th>
								<th>최대할인값</th>
								<th>최소주문금액</th>
								<th>상태</th>
								<th>중복가능여부</th>
								<th>수량</th>
								<th>사용량</th>
								<th>사용기간</th>
							</tr>
						</thead>
						<tbody>
							{sellerCouponList.length > 0 && (
								<>
									{sellerCouponList.map((coupon) => {
										const isChecked = selectedCouponId === coupon.couponId;

										return (
											<tr
												key={coupon.couponId}
												className={clsx(styles.sellerListTr, isChecked && styles.selectedCouponRow)}
												onClick={() => {
													setSelectedCouponId(isChecked ? null : coupon.couponId);
												}}
											>
												<td className={styles.checkboxCell}>
													<input
														type="checkbox"
														checked={isChecked}
														onChange={() => setSelectedCouponId(isChecked ? null : coupon.couponId)}
													/>
												</td>
												<td>{coupon.couponId}</td>
												<td>{coupon.description}</td>
												<td>{coupon.discountType}</td>
												<td>
													{coupon.discountValue}
													{coupon.discountType === "fixed_amount" ? "원" : "%"}
												</td>
												<td>{coupon.maxDiscount}</td>
												<td>{coupon.minimumOrderBeforeAmount}</td>
												<td>
													<button
														className={clsx(
															styles.statusButton,
															coupon.status === "ACTIVE" ? styles.active : styles.suspended,
														)}
													>
														{coupon.status}
													</button>
												</td>
												<td>{coupon.isStackable ? "가능" : "불가"}</td>
												<td>{coupon.amount}</td>
												<td>{coupon.usedCount}</td>
												<td>
													<span className="inline-block">{moment(coupon.startDate).format("YYYY-MM-DD HH:mm")}</span>
													<span className="inline-block ml-1">~ {moment(coupon.endDate).format("YYYY-MM-DD HH:mm")}</span>
												</td>
											</tr>
										);
									})}
								</>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
