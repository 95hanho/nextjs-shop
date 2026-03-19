"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./BuyClient.module.scss";
import OrderFormSection from "@/app/buy/OrderFormSection";
import OrderSummaryPanel from "@/app/buy/OrderSummaryPanel";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getNormal, postJson } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { AvailableCartCouponAtBuy, AvailableSellerCouponAtBuy, GetStockHoldResponse, StockHoldProduct } from "@/types/buy";
import { useAuth } from "@/hooks/useAuth";
import { BuyProvider } from "@/providers/buy/BuyProvider";
import { calculateDiscount } from "@/lib/price";

export type BuyItemWishCoupon = StockHoldProduct & {
	discountedPrice: number; // 해당 상품에 적용된 쿠폰 할인을 반영한 가격 (finalPrice에서 할인금액을 뺀 가격)
	discountAmount: number; // 해당 상품에 적용된 총 할인 금액
};
export type CartCoupon = AvailableCartCouponAtBuy & { used: boolean };
export type SellerCoupon = AvailableSellerCouponAtBuy & { used: boolean };

type AppliedCoupon = AvailableCartCouponAtBuy | AvailableSellerCouponAtBuy;
// 최대 할인쿠폰 저장
type AppliedCouponGroup = {
	unStackable: AppliedCoupon | null;
	stackable: AppliedCoupon[];
};
export type AppliedProductCouponMap = Record<
	number, // holdId
	AppliedCouponGroup
>;

export default function BuyClient() {
	const { loginOn } = useAuth();

	// =================================================================
	// React Query
	// =================================================================

	// 점유한 상품 조회
	// invalidateQueries(["stockHold"])
	const {
		data: stockHoldData,
		isLoading,
		isFetching,
		dataUpdatedAt,
	} = useQuery<GetStockHoldResponse, Error>({
		queryKey: ["stockHold"],
		queryFn: () => getNormal(getApiUrl(API_URL.BUY_PAY)),
		enabled: loginOn,
		refetchOnWindowFocus: false,
	});

	// 점유 연장 handleStockHoldExtend
	const { mutateAsync: handleStockHoldExtend } = useMutation({
		mutationFn: () => postJson(getApiUrl(API_URL.BUY_HOLD_EXTEND), {}),
		onSuccess() {},
		onError(err) {
			console.log("handleStockHoldExtend err", err);
		},
	});

	// =================================================================
	// React
	// =================================================================

	// 점유 연장 중복 방지용 Ref (inFlightRef가 true면 점유 연장 요청이 진행 중이므로 새로운 요청을 보내지 않음)
	const inFlightRef = useRef(false);

	// =================================================================
	// useEffect, useMemo
	// =================================================================

	// 1분마다 구매상품 점유 연장 시도 (구매페이지에 진입한 후 1분마다 연장 시도)
	useEffect(() => {
		const tick = async () => {
			// 중복 요청 방지 + 탭이 백그라운드에 있을 때는 연장 시도 안함
			// (브라우저가 백그라운드 탭의 setInterval 실행을 1분 이상 지연시킬 수 있기 때문)
			if (inFlightRef.current || document.hidden) return;
			inFlightRef.current = true;
			try {
				await handleStockHoldExtend();
			} finally {
				inFlightRef.current = false;
			}
		};

		const id = window.setInterval(tick, 60_000);
		// 필요하면 진입 직후 1회 즉시 호출
		tick();

		return () => window.clearInterval(id);
	}, [handleStockHoldExtend]);

	// 최대할인 쿠폰 저장
	const maxDiscountAppliedProductCouponMapRef = useRef<AppliedProductCouponMap>({});
	// holdId별 적용된 쿠폰
	const [appliedProductCouponMap, setAppliedProductCouponMap] = useState<AppliedProductCouponMap>({});
	const changeAppliedProductCoupon = (holdId: number, coupon: AppliedCoupon, isChecked: boolean) => {
		setAppliedProductCouponMap((prev) => {
			const prevForCart = prev[holdId] || { unStackable: null, stackable: [] };
			let newForCart: { unStackable: AppliedCoupon | null; stackable: AppliedCoupon[] };
			if (isChecked) {
				// 쿠폰 적용
				if (coupon.isStackable) {
					newForCart = {
						...prevForCart,
						stackable: [...prevForCart.stackable, coupon],
					};
				} else {
					newForCart = {
						...prevForCart,
						unStackable: coupon,
					};
				}
			} else {
				// 쿠폰 해제
				if (coupon.isStackable) {
					newForCart = {
						...prevForCart,
						stackable: prevForCart.stackable.filter((c) => c.couponId !== coupon.couponId),
					};
				} else {
					newForCart = {
						...prevForCart,
						unStackable: null,
					};
				}
			}
			return {
				...prev,
				[holdId]: newForCart,
			};
		});
	};

	// 최대 할인쿠폰 저장 및 초기 쿠폰을 통한 적용 쿠폰 저장.
	useEffect(() => {
		if (!stockHoldData) return;

		const availableCouponsWithDiscountObj = stockHoldData.availableSellerCoupons.reduce(
			(acc, coupon) => {
				if (acc[coupon.sellerName]) acc[coupon.sellerName] = [...acc[coupon.sellerName], coupon];
				else acc[coupon.sellerName] = [coupon];
				return acc;
			},
			{} as Record<string, AvailableSellerCouponAtBuy[]>,
		);

		const initialAppliedProductCouponMap: AppliedProductCouponMap = {};
		const initMaxDiscountAppliedProductCouponMap: AppliedProductCouponMap = {};
		const initUsedCouponIds: number[] = [];
		const userCopponIdToCouponMap: Record<number, AvailableCartCouponAtBuy | AvailableSellerCouponAtBuy> = {};
		[...stockHoldData.availableCartCoupons, ...stockHoldData.availableSellerCoupons].forEach((coupon) => {
			userCopponIdToCouponMap[coupon.userCouponId] = coupon;
		});

		const sortedStockHoldProductList = [...stockHoldData.stockHoldProductList].sort((a, b) => b.finalPrice * b.count - a.finalPrice * a.count); // 할인 전 가격 내림차순

		sortedStockHoldProductList.forEach((product) => {
			const initPrice = (product.finalPrice + product.addPrice) * product.count;
			// product.holdId;

			// 초기 적용 쿠폰 저장 ------------------------------------------------------------------------------------------------------------------------
			const holdCouponList = stockHoldData.holdCoupons.filter((holdCoupon) => holdCoupon.holdId === product.holdId);
			if (holdCouponList.length > 0) {
				const appliedCoupons = holdCouponList
					.map((holdCoupon) => userCopponIdToCouponMap[holdCoupon.userCouponId])
					.filter((c): c is AppliedCoupon => !!c);
				if (appliedCoupons.length > 0) {
					initialAppliedProductCouponMap[product.holdId] = {
						unStackable: appliedCoupons.find((coupon) => !coupon.isStackable) || null,
						stackable: appliedCoupons.filter((coupon) => coupon.isStackable),
					};
				}
			}

			// 최대 할인 쿠폰 저장 ------------------------------------------------------------------------------------------------------------------------
			const couponsForCart =
				stockHoldData.availableCartCoupons.filter(
					(coupon) =>
						(coupon.isProductRestricted && coupon.couponAllowedId && coupon.productId === product.productId) ||
						(!coupon.isProductRestricted && !coupon.couponAllowedId && !coupon.productId),
				) || [];
			const couponsForSeller =
				availableCouponsWithDiscountObj[product.sellerName]?.filter((coupon) => coupon.productId === product.productId) || [];

			const availableBuyCoupon = [...couponsForCart, ...couponsForSeller].filter((coupon) => calculateDiscount(initPrice, coupon) !== null);

			const availableMaxDiscountBuyCoupon = availableBuyCoupon.filter((coupon) => {
				return !initUsedCouponIds.includes(coupon.couponId);
			});
			if (availableMaxDiscountBuyCoupon.length > 0) {
				const selectedUnStackableCoupons = availableMaxDiscountBuyCoupon.filter((coupon) => !coupon.isStackable);
				const selectedMaxUnStackable = selectedUnStackableCoupons.reduce((max, coupon) => {
					const currentDiscount = calculateDiscount(initPrice, coupon) || 0;
					const maxDiscount = max ? calculateDiscount(initPrice, max) || 0 : 0;

					return currentDiscount > maxDiscount ? coupon : max;
				}, selectedUnStackableCoupons[0] as AppliedCoupon);
				const selectedStackableCouponList = availableMaxDiscountBuyCoupon.filter((coupon) => coupon.isStackable);

				initUsedCouponIds.push(selectedMaxUnStackable?.couponId, ...selectedStackableCouponList.map((coupon) => coupon.couponId));
				initMaxDiscountAppliedProductCouponMap[product.holdId] = {
					unStackable: selectedMaxUnStackable,
					stackable: selectedStackableCouponList,
				};
			}
		});

		// console.log({ initialAppliedProductCouponMap /* initMaxDiscountAppliedProductCouponMap */ });
		// 초기 적용 쿠폰 저장
		setAppliedProductCouponMap(initialAppliedProductCouponMap);
		// 최대 할인 쿠폰 저장
		maxDiscountAppliedProductCouponMapRef.current = initMaxDiscountAppliedProductCouponMap;
	}, [stockHoldData]);

	const {
		buyItemList,
		defaultAddress,
		cartCouponList,
		sellerCouponList,
		// 금액 표시 위해 계산된 값들
		buyTotalOriginPrice, // 할인 전 총 상품 가격 (addPrice, count 반영된 가격)
		buyTotalFinalPrice, // 할인 후 총 상품 가격 (addPrice, count, 쿠폰 할인 반영된 가격)
		buySelfDiscount, // 자체 할인가
		cartCouponDiscount, // 장바구니쿠폰 할인가
		sellerCouponDiscount, // 판매자쿠폰 할인가
	} = useMemo(() => {
		// API 응답 전
		if (!stockHoldData) {
			return {
				buyItemList: [],
				defaultAddress: null,
				cartCouponList: [],
				sellerCouponList: [],
				buyTotalOriginPrice: 0,
				buyTotalFinalPrice: 0,
				buySelfDiscount: 0,
				cartCouponDiscount: 0,
				sellerCouponDiscount: 0,
			};
		}
		// API 응답 후 / 쿠폰 적용 변경 시
		const buyItemList: BuyItemWishCoupon[] = [];
		let buyTotalOriginPrice = 0;
		let buyTotalFinalPrice = 0;
		let buySelfDiscount = 0;
		let cartCouponDiscount = 0;
		let sellerCouponDiscount = 0;

		// 배송비 계산을 위한 객체
		const deliveryInfoBySeller: Record<
			string,
			{
				totalFinalPrice: number; // 해당 판매자 상품들의 자체 할인가 가격 총합
				baseShippingFee: number; // 기본 배송비
				freeShippingMinAmount: number; // 무료배송 최소 주문금액
			}
		> = {};

		stockHoldData.stockHoldProductList.forEach((product) => {
			const initPrice = (product.finalPrice + product.addPrice) * product.count;
			const buyItem: BuyItemWishCoupon = {
				...product,
				discountedPrice: initPrice,
				discountAmount: 0,
			};

			// 자체할인가 계산
			buyTotalOriginPrice += product.originPrice * product.count;
			buySelfDiscount += (product.originPrice - product.finalPrice) * product.count;

			// 배송비 계산 정보 저장
			if (!deliveryInfoBySeller[product.sellerName]) {
				deliveryInfoBySeller[product.sellerName] = {
					totalFinalPrice: buyItem.finalPrice * buyItem.count,
					baseShippingFee: product.baseShippingFee,
					freeShippingMinAmount: product.freeShippingMinAmount,
				};
			} else {
				deliveryInfoBySeller[product.sellerName].totalFinalPrice += buyItem.finalPrice * buyItem.count;
			}

			// 적용 쿠폰에 따라 discountedPrice와 discountAmount 계산
			const appliedProductCoupon = appliedProductCouponMap[product.holdId];
			if (appliedProductCoupon) {
				if (appliedProductCoupon.unStackable) {
					const unStackableDiscount = calculateDiscount(buyItem.discountedPrice, appliedProductCoupon.unStackable) || 0;
					buyItem.discountAmount += unStackableDiscount;
					if ("sellerName" in appliedProductCoupon.unStackable) {
						sellerCouponDiscount += unStackableDiscount;
					} else {
						cartCouponDiscount += unStackableDiscount;
					}
					// 구매 쿠폰 추가(중복 불가능)
					// buyCouponIds.push(appliedProductCoupon.unStackable.couponId);
				}
				if (appliedProductCoupon.stackable.length > 0) {
					appliedProductCoupon.stackable.forEach((coupon) => {
						const stackableDiscount = calculateDiscount(buyItem.discountedPrice, coupon) || 0;
						buyItem.discountAmount += stackableDiscount;
						if ("sellerName" in coupon) sellerCouponDiscount += stackableDiscount;
						else cartCouponDiscount += stackableDiscount;
					});
					// 구매 쿠폰 추가(중복 가능)
					// buyCouponIds.push(...appliedProductCoupon.stackable.map((c) => c.couponId));
				}
				buyItem.discountedPrice -= buyItem.discountAmount;
			}
			buyTotalFinalPrice += buyItem.discountedPrice;

			// 구매 리스트 넣기
			buyItemList.push(buyItem);
		});

		const usedSet = stockHoldData.holdCoupons.map((c) => c.userCouponId);

		return {
			buyItemList,
			defaultAddress: stockHoldData.defaultAddress,
			cartCouponList: stockHoldData.availableCartCoupons.map((coupon) => ({ ...coupon, used: usedSet.includes(coupon.userCouponId) })),
			sellerCouponList: stockHoldData.availableSellerCoupons.map((coupon) => ({ ...coupon, used: usedSet.includes(coupon.userCouponId) })),
			buyTotalOriginPrice,
			buyTotalFinalPrice,
			buySelfDiscount,
			cartCouponDiscount,
			sellerCouponDiscount,
		};
	}, [stockHoldData, appliedProductCouponMap]);

	// 디버깅용 log
	useEffect(() => {
		if (stockHoldData) console.log({ stockHoldData });
		if (cartCouponList.length > 0 || sellerCouponList.length > 0) {
			// console.log({ cartCouponList, sellerCouponList });
		}
		// console.log({ buyTotalOriginPrice, buyTotalFinalPrice, buySelfDiscount, cartCouponDiscount, sellerCouponDiscount });
	}, [
		stockHoldData,
		cartCouponList,
		sellerCouponList,
		buyTotalOriginPrice,
		buyTotalFinalPrice,
		buySelfDiscount,
		cartCouponDiscount,
		sellerCouponDiscount,
	]);

	// =================================================================
	// UI
	// =================================================================

	const OrderFormSectionProps = {
		buyItemList,
		cartCouponList,
		sellerCouponList,
		appliedProductCouponMap,
		//
		buyTotalFinalPrice,
	};

	if (!stockHoldData) return null;
	return (
		<div className={styles.buy}>
			<BuyProvider defaultAddress={defaultAddress}>
				<div className={styles.page}>
					<h1 className={styles.pageTitle}>주문서</h1>

					<div className={styles.layout}>
						{/* LEFT */}
						<OrderFormSection {...OrderFormSectionProps} />

						{/* RIGHT */}
						<OrderSummaryPanel />
					</div>
				</div>
			</BuyProvider>
		</div>
	);
}
