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

export type BuyItemWishCoupon = StockHoldProduct & {
	discountedPrice: number; // 해당 상품에 적용된 쿠폰 할인을 반영한 가격 (finalPrice에서 할인금액을 뺀 가격)
	discountAmount: number; // 해당 상품에 적용된 총 할인 금액
};
export type CartCoupon = AvailableCartCouponAtBuy & { used: boolean };
export type SellerCoupon = AvailableSellerCouponAtBuy & { used: boolean };

type AppliedCoupon = AvailableCartCouponAtBuy | AvailableSellerCouponAtBuy;
// 최대 할인쿠폰 저장
export type MaxDiscountedCouponMap = Record<
	number, // cartId
	{
		unStackable: AppliedCoupon | null;
		stackable: AppliedCoupon[];
	}
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

	// 최대할인가 저장
	const maxDiscountedPriceRef = useRef<MaxDiscountedCouponMap>({});
	useEffect(() => {}, []);

	const { buyItemList, defaultAddress } = useMemo(() => {
		// API 응답 전
		if (!stockHoldData) {
			return {
				buyItemList: [],
				defaultAddress: null,
			};
		}
		// API 응답 후 / 쿠폰 적용 변경 시
		const buyItemList: BuyItemWishCoupon[] = [];

		stockHoldData.stockHoldProductList.forEach((product) => {
			const initPrice = (product.finalPrice + product.addPrice) * product.count;
			const buyItem: BuyItemWishCoupon = { ...product, discountedPrice: initPrice, discountAmount: 0 };

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
