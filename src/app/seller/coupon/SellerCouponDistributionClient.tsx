"use client";

import API_URL from "@/api/endpoints";
import { getNormal, postJson } from "@/api/fetchFilter";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import {
	GetSellerCouponListResponse,
	GetSellerInterestingUserResponse,
	IssueCouponToUsersRequest,
	IssueCouponType,
	SellerCoupon,
} from "@/types/seller";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import styles from "./SellerCouponDistribution.module.scss";
import { useMemo, useState } from "react";
import clsx from "clsx";
import moment from "moment";
import { money } from "@/lib/format";
import { useGlobalDialogStore } from "@/store/globalDialog.store";

export default function SellerCouponDistributionClient() {
	// 1) [store / custom hooks] -------------------------------------------
	const { loginOn } = useSellerAuth();
	const { openDialog } = useGlobalDialogStore();
	const queryClient = useQueryClient();

	// 선택된 쿠폰
	// 2) [useState / useRef] ----------------------------------------------
	const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);

	// 3) [useQuery / useMutation] -----------------------------------------
	// 판매자와 관련된 회원 조회
	const {
		data: summary = null,
		// isFetching,
	} = useQuery<
		GetSellerInterestingUserResponse,
		Error,
		{
			viewedUserCount: number; // 내 상품 본 회원 수
			wishedUserCount: number; // 위시한 회원 수
			bookmarkedUserCount: number; // 브랜드 즐겨찾기한 회원 수
			cartUserCount: number; // 장바구니 담은 회원 수
			orderedUserCount: number; // 구매한 회원 수 (나중용)
		}
	>({
		queryKey: ["sellerInterestingUser", selectedCouponId],
		queryFn: () =>
			getNormal(getApiUrl(API_URL.SELLER_INTERESTING_USER), {
				couponId: selectedCouponId!,
			}),
		enabled: loginOn && selectedCouponId !== null,
		refetchOnWindowFocus: false,
		select: (data) => data.summary,
	});
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
	// 쿠폰을 유저에게 발행하기
	const { mutateAsync: issueCouponToUsers } = useMutation({
		mutationKey: ["issueCouponToUsers"],
		mutationFn: (issueCouponForm: IssueCouponToUsersRequest) =>
			postJson(getApiUrl(API_URL.SELLER_COUPON_USER_COUPON), {
				...issueCouponForm,
			}),
		onSuccess: () => {
			openDialog("ALERT", {
				content: "쿠폰이 발행되었습니다.",
			});
			queryClient.invalidateQueries({ queryKey: ["sellerInterestingUser"] });
		},
	});

	// 4) [derived values / useMemo] ---------------------------------------
	const { allZero } = useMemo(() => {
		return {
			allZero: Object.values(summary || {}).every((count) => count === 0),
		};
	}, [summary]);

	// 5) [handlers / useCallback] -----------------------------------------
	// 쿠폰 발행 하기
	const hadleIssueCoupon = (type: IssueCouponType) => {
		if (!selectedCouponId) return;

		openDialog("CONFIRM", {
			content: "선택한 쿠폰을 회원들에게 발행하시겠습니까?",
			handleAfterOk: async () => {
				await issueCouponToUsers({ couponId: selectedCouponId, type });
			},
		});
	};

	return (
		<div className={styles.sellerCouponDistribution}>
			<div id="couponDistribution" className={styles.couponDistribution}>
				<h2>쿠폰 배포 </h2>
				{!summary ? (
					<p>쿠폰을 선택해주세요.</p>
				) : (
					<>
						{allZero && <p>배포할 회원이 없습니다.</p>}
						{!allZero && (
							<section className={clsx(styles.couponDistributionInfo, { [styles.disabled]: !selectedCouponId })}>
								{summary.viewedUserCount > 0 && (
									<div>
										<button onClick={() => hadleIssueCoupon("VIEW")}>
											내 상품을 본 회원({money(summary.viewedUserCount)}명)에게 배포
										</button>
									</div>
								)}
								{summary.wishedUserCount > 0 && (
									<div>
										<button onClick={() => hadleIssueCoupon("WISH")}>
											내 상품을 즐겨찾기한 회원({money(summary.wishedUserCount)}명)에게 배포
										</button>
									</div>
								)}
								{summary.cartUserCount > 0 && (
									<div>
										<button onClick={() => hadleIssueCoupon("CART")}>
											내 상품을 장바구니에 넣은 회원({money(summary.cartUserCount)}명)에게 배포
										</button>
									</div>
								)}
								{summary.orderedUserCount > 0 && (
									<div>
										<button onClick={() => hadleIssueCoupon("ORDER")}>
											내 상품을 구매한 회원({money(summary.orderedUserCount)}명)에게 배포
										</button>
									</div>
								)}
							</section>
						)}
					</>
				)}
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
