"use client";

import { useEffect, useMemo, useRef } from "react";
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
	appliedProductCouponMap: AppliedCouponGroup; // 해당 상품에 적용된 쿠폰 정보 (최대 할인 쿠폰 + 스택형 쿠폰 리스트)
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
	const maxDiscountedPriceRef = useRef<AppliedProductCouponMap>({});
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
		const initUsedCouponIds: number[] = [];

		const sortedStockHoldProductList = [...stockHoldData.stockHoldProductList].sort((a, b) => b.finalPrice * b.count - a.finalPrice * a.count); // 할인 전 가격 내림차순

		sortedStockHoldProductList.forEach((product) => {
			const initPrice = (product.finalPrice + product.addPrice) * product.count;

			const couponsForCart =
				stockHoldData.availableCartCoupons.filter(
					(coupon) =>
						(coupon.isProductRestricted && coupon.couponAllowedId && coupon.productId === product.productId) ||
						(!coupon.isProductRestricted && !coupon.couponAllowedId && !coupon.productId),
				) || [];
			const couponsForSeller =
				availableCouponsWithDiscountObj[product.sellerName]?.filter((coupon) => coupon.productId === product.productId) || [];

			const availableCartCoupon = [...couponsForCart, ...couponsForSeller].filter((coupon) => {
				return !initUsedCouponIds.includes(coupon.couponId) && calculateDiscount(initPrice, coupon) !== null;
			});

			if (availableCartCoupon.length === 0) return;

			const selectedUnStackableCoupons = availableCartCoupon.filter((coupon) => !coupon.isStackable);
			const selectedMaxUnStackable = selectedUnStackableCoupons.reduce((max, coupon) => {
				const currentDiscount = calculateDiscount(initPrice, coupon) || 0;
				const maxDiscount = max ? calculateDiscount(initPrice, max) || 0 : 0;

				return currentDiscount > maxDiscount ? coupon : max;
			}, selectedUnStackableCoupons[0] as AppliedCoupon);
			const selectedStackableCouponList = availableCartCoupon.filter((coupon) => coupon.isStackable);

			initUsedCouponIds.push(selectedMaxUnStackable?.couponId, ...selectedStackableCouponList.map((coupon) => coupon.couponId));
			initialAppliedProductCouponMap[product.holdId] = {
				unStackable: selectedMaxUnStackable,
				stackable: selectedStackableCouponList,
			};
		});

		maxDiscountedPriceRef.current = initialAppliedProductCouponMap;
		console.log("initial max discounted coupon map", initialAppliedProductCouponMap);
	}, [stockHoldData]);

	const {
		buyItemList,
		defaultAddress,
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
			};
		}
		// API 응답 후 / 쿠폰 적용 변경 시
		const buyItemList: BuyItemWishCoupon[] = [];
		let buyTotalOriginPrice = 0;
		const buyTotalFinalPrice = 0;
		let buySelfDiscount = 0;
		const cartCouponDiscount = 0;
		const sellerCouponDiscount = 0;

		// 배송비 계산을 위한 객체
		const deliveryInfoBySeller: Record<
			string,
			{
				totalFinalPrice: number; // 해당 판매자 상품들의 자체 할인가 가격 총합
				baseShippingFee: number; // 기본 배송비
				freeShippingMinAmount: number; // 무료배송 최소 주문금액
			}
		> = {};

		// 쿠폰정보들 정렬
		const sortedCoupons = [...stockHoldData.availableCartCoupons, ...stockHoldData.availableSellerCoupons];
		sortedCoupons.sort((a, b) => a.userCouponId - b.userCouponId); // userCouponId 오름차순 정렬 (API에서 내려주는 순서가 보장되지 않으므로)

		const holdCouponsMap = stockHoldData.holdCoupons.reduce(
			(acc, holdCoupon) => {
				if (acc[holdCoupon.holdId]) return acc;
				const couponList = sortedCoupons.filter((c) => c.userCouponId === holdCoupon.userCouponId);
				if (couponList.length === 0) return acc;
				acc[holdCoupon.holdId] = [...couponList];
				return acc;
			},
			{} as Record<number, AppliedCoupon[]>,
		);

		console.log("holdCouponsMap", holdCouponsMap);

		stockHoldData.stockHoldProductList.forEach((product) => {
			const initPrice = (product.finalPrice + product.addPrice) * product.count;
			const buyItem: BuyItemWishCoupon = {
				...product,
				discountedPrice: initPrice,
				discountAmount: 0,
				appliedProductCouponMap: { unStackable: null, stackable: [] },
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
			const appliedCoupons = holdCouponsMap[product.holdId] || [];
			if (appliedCoupons.length > 0) {
				const unStackableCoupon = appliedCoupons.find((coupon) => !coupon.isStackable) || null;
				const stackableCoupons = appliedCoupons.filter((coupon) => coupon.isStackable);
			}

			// 구매 리스트 넣기
			buyItemList.push(buyItem);
		});

		return {
			buyItemList,
			defaultAddress: stockHoldData.defaultAddress,
		};
	}, [stockHoldData]);

	// 디버깅용 log
	useEffect(() => {
		if (stockHoldData) console.log({ stockHoldData });
	}, [stockHoldData]);

	// =================================================================
	// UI
	// =================================================================

	const OrderFormSectionProps = {
		buyItemList,
	};

	if (!stockHoldData) return null;
	return (
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
	);
}
