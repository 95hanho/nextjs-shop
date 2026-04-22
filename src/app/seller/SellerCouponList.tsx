import { AddCouponRequest, SellerCoupon, UpdateCouponRequest } from "@/types/seller";
import styles from "./SellerMain.module.scss";
import moment from "moment";
import { IoMdSettings } from "react-icons/io";
import React from "react";
import clsx from "clsx";
import { FaExchangeAlt } from "react-icons/fa";
import { useModalStore } from "@/store/modal.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { deleteNormal, postJson, putJson } from "@/api/fetchFilter";
import { useGlobalDialogStore } from "@/store/globalDialog.store";

interface CouponListProps {
	sellerCouponList: SellerCoupon[];
	allowedSelectedCouponId: number | null;
	changeAllowedSelectedCouponId: (id: number | null) => void;
	selectedCouponIds: number[];
	changeSelectedCouponIds: (id: number) => void;
	changeAllSelectedCouponIds: (isChecked: boolean) => void;
	updateCouponStatus: (params: { activeCouponIds?: number[]; suspendedCouponIds?: number[] }) => void;
}

export default function SellerCouponList({
	sellerCouponList,
	changeAllowedSelectedCouponId,
	allowedSelectedCouponId,
	selectedCouponIds,
	changeSelectedCouponIds,
	changeAllSelectedCouponIds,
	updateCouponStatus,
}: CouponListProps) {
	// 1) [store / custom hooks] -------------------------------------------
	const queryClient = useQueryClient();
	const { openModal } = useModalStore();
	const { openDialog } = useGlobalDialogStore();

	// 3) [useQuery / useMutation] -----------------------------------------
	// 쿠폰 등록
	const { mutate: registerCoupon } = useMutation({
		mutationFn: (couponForm: AddCouponRequest) => postJson(getApiUrl(API_URL.SELLER_COUPON), { ...couponForm }),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ["sellerCouponList"] });
		},
	});
	// 쿠폰 수정
	const { mutate: updateCoupon } = useMutation({
		mutationFn: (couponForm: UpdateCouponRequest) => putJson(getApiUrl(API_URL.SELLER_COUPON), { ...couponForm }),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ["sellerCouponList"] });
		},
	});
	// 쿠폰 삭제
	const { mutate: deleteCoupon } = useMutation({
		mutationFn: (couponId: number) => deleteNormal(getApiUrl(API_URL.SELLER_COUPON_DELETE), { couponId }),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ["sellerCouponList"] });
		},
	});

	// 4) [derived values / useMemo] ---------------------------------------
	// 쿠폰 허용 제품이 하나라도 있으면 true
	const couponAllowedMode = allowedSelectedCouponId !== null;

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
								handleAfterAddCoupon: (coupon) => {
									registerCoupon(coupon);
								},
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
														prevSellerCoupon: coupon,
														disableOverlayClose: true,
														handleAfterUpdateCoupon: (coupon) => {
															updateCoupon(coupon);
														},
														handleAfterDeleteCoupon: (couponId) => {
															deleteCoupon(couponId);
														},
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
														openDialog("CONFIRM", {
															content: "쿠폰 상태를 변경하시겠습니까?",
															handleAfterClose: () => {},
															handleAfterOk: () => {
																updateCouponStatus({
																	activeCouponIds: coupon.status === "ACTIVE" ? [coupon.couponId] : [],
																	suspendedCouponIds: coupon.status === "SUSPENDED" ? [coupon.couponId] : [],
																});
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
	);
}
