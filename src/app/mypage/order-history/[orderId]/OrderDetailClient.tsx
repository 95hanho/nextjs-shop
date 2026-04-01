"use client";

import { useQuery } from "@tanstack/react-query";
import styles from "./OrderDetail.module.scss";
import { getNormal } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { useAuth } from "@/hooks/useAuth";
import { useMemo, useState } from "react";
import { MyOrderDetailItem, MyOrderDetailResponse } from "@/types/mypage";
import { BsClipboard2Minus } from "react-icons/bs";
import { money } from "@/lib/format";
import { GoHome } from "react-icons/go";
import { SmartImage } from "@/components/ui/SmartImage";
import Link from "next/link";
import { getOrderStatusLabel } from "@/lib/order";
import moment from "moment";
import "moment/locale/ko"; // 한국어 로케일 추가

type ItemSellerMap = {
	[sellerName: string]: MyOrderDetailItem[];
};

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
	// React
	// =================================================================

	const [openCouponInfo, setOpenCouponInfo] = useState<number | null>(null); // 열린 쿠폰 정보의 orderItemId

	// =================================================================
	// useEffect, useMemo
	// =================================================================

	const { myOrderDetail, originTotalPrice, selfDiscountTotal, couponDiscountTotal, itemSellerMap } = useMemo(() => {
		if (!orderDetailData)
			return {
				myOrderDetail: null,
				myOrderDetailItems: [],
				originTotalPrice: 0,
				selfDiscountTotal: 0,
				couponDiscountTotal: 0,
				itemSellerMap: {},
			};
		// ----------------------------------
		let initialTotalPrice = 0;
		let initSelfDiscountTotal = 0;
		let initCouponDiscountTotal = 0;
		const initItemSellerMap: ItemSellerMap = {};

		orderDetailData.myOrderDetailItems.forEach((item) => {
			const itemOriginTotalPrice = (item.originPrice + item.addPrice) * item.count;
			const itemFinalTotalPrice = (item.finalPrice + item.addPrice) * item.count;
			initialTotalPrice += itemOriginTotalPrice;
			initSelfDiscountTotal += itemOriginTotalPrice - itemFinalTotalPrice;
			initCouponDiscountTotal += item.couponDiscountedPrice || 0;
			// 판매자별 주문상품리스트 구성
			if (initItemSellerMap[item.sellerName]) initItemSellerMap[item.sellerName].push(item);
			else initItemSellerMap[item.sellerName] = [item];
		});

		const result = {
			myOrderDetail: orderDetailData?.myOrderDetail,
			originTotalPrice: initialTotalPrice,
			selfDiscountTotal: initSelfDiscountTotal,
			couponDiscountTotal: initCouponDiscountTotal,
			itemSellerMap: initItemSellerMap,
		};
		console.log("result", result);
		return result;
	}, [orderDetailData]);

	if (!orderDetailData) return null;
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
					<article className={styles.orderItemSection}>
						<h2>주문상품 / 적용 쿠폰 정보</h2>
						<div className={styles.orderItemList}>
							<ul>
								{Object.entries(itemSellerMap).map(([sellerName, items]) => (
									<li key={"itemSeller-" + sellerName}>
										<header className={styles.sellerInfo}>
											<div className={styles.sellerName}>
												<Link href="#">
													{sellerName}{" "}
													<i className="inline-block">
														<GoHome />
													</i>
												</Link>
												<h5>무료 배송</h5>
											</div>
											<div className={styles.sellerActions}>
												<button>문의하기</button>
											</div>
										</header>
										<div className="mt-2">
											{items.map((item) => (
												<section key={"orderItem-" + item.orderItemId} className={styles.orderItemInfo}>
													<div className={styles.orderItem}>
														<div className={styles.orderStatus}>
															<span className={styles.orderStatusText}>{getOrderStatusLabel(item.status)}</span>
															<span className={styles.orderStatusDate}>
																구매확정일 {moment(myOrderDetail?.orderDate).format("YYYY. M. D. (ddd)")}
															</span>
														</div>
														<div className={styles.orderItemContent}>
															<div className={styles.productImage}>
																<SmartImage fill={true} src={item.filePath} />
															</div>
															<div className={styles.productInfo}>
																<h4>{item.productName}</h4>
																<h5>
																	{item.size} / {item.count}개
																</h5>
																<div className={styles.price}>
																	<span>{money(item.finalPrice * item.count - item.couponDiscountedPrice)}원</span>
																	<del>{money(item.originPrice * item.count)}</del>
																</div>
																{item.coupons.length > 0 && (
																	<div className={styles.couponButton}>
																		<button
																			onClick={() =>
																				setOpenCouponInfo(
																					openCouponInfo === item.orderItemId ? null : item.orderItemId,
																				)
																			}
																		>
																			사용쿠폰{" "}
																			{openCouponInfo === item.orderItemId
																				? "숨기기 △"
																				: `보기(${item.coupons.length}) ▽`}
																		</button>
																	</div>
																)}
															</div>
														</div>
													</div>
													{openCouponInfo === item.orderItemId && item.coupons.length > 0 && (
														<div className={styles.couponInfo}>
															{item.coupons.map((coupon) => (
																<div key={"orderItemCoupon-" + coupon.userCouponId} className={styles.couponList}>
																	<div className={styles.couponContent}>
																		{coupon.sellerNo == null ? (
																			<mark className={styles.cartMark}>장바구니</mark>
																		) : (
																			<mark className={styles.sellerMark}>판매자</mark>
																		)}
																		<span>{coupon.description}</span>
																	</div>
																	<div className="font-bold tracking-wide">-{money(coupon.discountedPrice)}</div>
																</div>
															))}
															{/* <div className={styles.couponList}>
																<div className={styles.couponContent}>
																	
																	<span>Urban Style 5천원 (스택가능)</span>
																</div>
																<div>-5,000</div>
															</div> */}
														</div>
													)}
													<div className={styles.orderItemActions}>
														<button className={styles.active}>배송조회</button>
														<button>장바구니 담기</button>
														<button>리뷰 작성</button>
													</div>
												</section>
											))}
										</div>
									</li>
								))}
							</ul>
						</div>
					</article>
					{/* 배송지 정보 */}
					{myOrderDetail && (
						<article className={styles.addressSection}>
							<h2>배송지 정보</h2>
							<div className={styles.addressInfo}>
								<h3>{myOrderDetail.addressName}</h3>
								<h6>{myOrderDetail.addressPhone}</h6>
								<h4>
									{myOrderDetail.address} {myOrderDetail.addressDetail}({myOrderDetail.zonecode})
								</h4>
								<h5>
									<i>
										<BsClipboard2Minus />
									</i>
									{myOrderDetail.memo}
								</h5>
							</div>
						</article>
					)}

					{/* 결제정보 */}
					{myOrderDetail && (
						<article className={styles.paymentSection}>
							<h2>결제정보</h2>
							<div className={styles.paymentInfo}>
								<div className={styles.totalPrice}>
									<span>주문금액</span>
									<span>총 {money(myOrderDetail.totalPrice)}원</span>
								</div>
								<div className={styles.priceDetail}>
									<div>
										<span>상품금액</span>
										<span>{money(originTotalPrice)}원</span>
									</div>
									{selfDiscountTotal > 0 && (
										<div>
											<span>자체 할인금액</span>
											<span>-{money(selfDiscountTotal)}원</span>
										</div>
									)}
									{couponDiscountTotal > 0 && (
										<div>
											<span>쿠폰 할인금액</span>
											<span>-{money(couponDiscountTotal)}원</span>
										</div>
									)}
									<div>
										<span>배송비</span>
										<span>{money(myOrderDetail.shippingFee)}원</span>
									</div>
								</div>
								<div className={styles.paymentMethod}>
									<span>마일리지 사용</span>
									<span>{money(myOrderDetail.usedMileage)}원</span>
								</div>
								<div className={styles.earnedMileage}>
									<span>적립 마일리지</span>
									<span className={styles.price}>{money(myOrderDetail.earnedMileage)}원</span>
								</div>
							</div>
						</article>
					)}
				</section>
			</div>
		</div>
	);
}
