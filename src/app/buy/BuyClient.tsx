"use client";

import { useEffect, useRef } from "react";
import styles from "./BuyClient.module.scss";
import OrderFormSection from "@/app/buy/OrderFormSection";
import OrderSummaryPanel from "@/app/buy/OrderSummaryPanel";
import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";

export default function BuyClient() {
	// =================================================================
	// React Query
	// =================================================================

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
				// await handleStockHoldExtend();
			} finally {
				inFlightRef.current = false;
			}
		};

		const id = window.setInterval(tick, 60_000);
		// 필요하면 진입 직후 1회 즉시 호출
		// tick();

		return () => window.clearInterval(id);
	}, [handleStockHoldExtend]);

	// =================================================================
	// UI
	// =================================================================

	return (
		<div className={styles.page}>
			<h1 className={styles.pageTitle}>주문서</h1>

			<div className={styles.layout}>
				{/* LEFT */}
				<OrderFormSection />

				{/* RIGHT */}
				<OrderSummaryPanel />
			</div>
		</div>
	);
}
