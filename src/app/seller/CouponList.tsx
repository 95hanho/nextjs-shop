import { SellerCoupon } from "@/types/seller";
import styles from "./SellerMain.module.scss";
import moment from "moment";
import { IoMdSettings } from "react-icons/io";
import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { FaExchangeAlt } from "react-icons/fa";
import { useModalStore } from "@/store/modal.store";
import { ModalResultMap } from "@/store/modal.type";

interface CouponListProps {
	sellerCouponList: SellerCoupon[];
	allowedSelectedCouponId: number | null;
	changeAllowedSelectedCouponId: (id: number | null) => void;
	selectedCouponIds: number[];
	changeSelectedCouponIds: (id: number) => void;
	changeAllSelectedCouponIds: (isChecked: boolean) => void;
	updateCouponStatus: (params: { activeCouponIds?: number[]; suspendedCouponIds?: number[] }) => void;
}

export default function CouponList({
	sellerCouponList,
	changeAllowedSelectedCouponId,
	allowedSelectedCouponId,
	selectedCouponIds,
	changeSelectedCouponIds,
	changeAllSelectedCouponIds,
	updateCouponStatus,
}: CouponListProps) {
	const couponAllowedMode = allowedSelectedCouponId !== null; // 쿠폰 허용 제품이 하나라도 있으면 true
	const { openModal, clearModalResult, modalResult } = useModalStore();

	// ------------------------------------------------
	// React
	// ------------------------------------------------

	// 상태 변경중 쿠폰
	const [changingCoupon, setChangingCoupon] = useState<SellerCoupon | null>(null);

	// ------------------------------------------------
	// useEffect, useMemo
	// ------------------------------------------------

	// 모달 결과 처리
	useEffect(() => {
		if (!modalResult) return;

		if (modalResult.action === "CONFIRM_OK") {
			const payload = modalResult.payload as ModalResultMap["CONFIRM_OK"];
			if (payload?.result === "COUPON_STATUS_CHANGE") {
				if (changingCoupon) {
					updateCouponStatus({
						activeCouponIds: changingCoupon.status === "ACTIVE" ? [changingCoupon.couponId] : [],
						suspendedCouponIds: changingCoupon.status === "SUSPENDED" ? [changingCoupon.couponId] : [],
					});
				}
			}
		}

		clearModalResult();
	}, [clearModalResult, modalResult, updateCouponStatus, changingCoupon]);

	return (
		<div id="sellerCouponList" className={styles.sellerCouponList}>
			<h2>
				쿠폰 목록
				{couponAllowedMode ? (
					<button className={styles.cancelProductRestrictionButton} onClick={() => changeAllowedSelectedCouponId(null)}>
						상품제한취소
					</button>
				) : (
					<button
						className={styles.registerCouponButton}
						onClick={() => {
							openModal("SELLER_COUPON", {
								disableOverlayClose: true,
							});
						}}
					>
						쿠폰등록
					</button>
				)}
			</h2>
			<div className={styles.couponTableWrapper}>
				<table className={styles.couponTable}>
					<thead>
						<tr>
							<th className={styles.checkboxCell}>
								<input
									type="checkbox"
									checked={selectedCouponIds.length === sellerCouponList.length}
									disabled={couponAllowedMode}
									onChange={(e) => changeAllSelectedCouponIds(e.target.checked)}
								/>
							</th>
							<th>couponId</th>
							<th>설명</th>
							<th>타입</th>
							<th>할인값</th>
							<th>최대할인값</th>
							<th>최소주문금액</th>
							<th>상태</th>
							<th>중복가능여부</th>
							<th>상품제한</th>
							<th>수량</th>
							<th>사용량</th>
							<th>사용기간</th>
						</tr>
					</thead>
					<tbody>
						{sellerCouponList.length > 0 && (
							<>
								{sellerCouponList.map((coupon) => {
									const isChecked = selectedCouponIds.includes(coupon.couponId);
									const allowedSelecting = allowedSelectedCouponId === coupon.couponId;

									return (
										<tr
											key={coupon.couponId}
											className={clsx(
												styles.sellerListTr,
												isChecked && styles.selectedCouponRow,
												couponAllowedMode && styles.disabled,
											)}
											onClick={() => {
												if (!couponAllowedMode) {
													changeSelectedCouponIds(coupon.couponId);
												}
											}}
											onDoubleClick={() => {
												if (!couponAllowedMode) {
													openModal("SELLER_COUPON", {
														coupon,
														disableOverlayClose: true,
													});
												}
											}}
										>
											<td className={styles.checkboxCell}>
												<input
													type="checkbox"
													checked={isChecked}
													disabled={couponAllowedMode}
													onChange={() => changeSelectedCouponIds(coupon.couponId)}
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
													onClick={(e) => {
														e.stopPropagation();
														setChangingCoupon(coupon);
														openModal("CONFIRM", {
															content: "쿠폰 상태를 변경하시겠습니까?",
															okResult: "COUPON_STATUS_CHANGE",
															handleAfterClose: () => {
																setChangingCoupon(null);
															},
														});
													}}
												>
													{coupon.status}
													<FaExchangeAlt />
												</button>
											</td>
											<td>{coupon.isStackable ? "가능" : "불가"}</td>
											<td>
												{coupon.isProductRestricted ? (
													allowedSelecting ? (
														<span className="text-red-600">선택중</span>
													) : (
														<button
															className={styles.productRestrictionButton}
															onClick={(e) => {
																e.stopPropagation();
																changeAllowedSelectedCouponId(coupon.couponId);
															}}
														>
															제한 <IoMdSettings />
														</button>
													)
												) : (
													"없음"
												)}
											</td>
											<td>{coupon.amount}</td>
											<td>{coupon.usedCount}</td>
											<td>
												{moment(coupon.startDate).format("YYYY-MM-DD")} ~ {moment(coupon.endDate).format("YYYY-MM-DD")}
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
	);
}
