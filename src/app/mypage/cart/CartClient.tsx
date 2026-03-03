"use client";

import { AvailableProductForProduct, CartItem, GetCartResponse } from "@/types/mypage";
import { useQuery } from "@tanstack/react-query";
import API_URL from "@/api/endpoints";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useAuth } from "@/hooks/useAuth";
import { getNormal } from "@/api/fetchFilter";
import React, { useMemo } from "react";
import { LodingWrap } from "@/components/common/LodingWrap";
import Error from "next/error";
import styles from "./CartClient.module.scss";
import CartSummaryAside from "@/app/mypage/cart/CartSummaryAside";
import CartProductSection from "@/app/mypage/cart/CartProductSection";
import { AvailableProductCoupon } from "@/types/product";

export type BrandGroupEntry = [sellerName: string, items: CartItem[]];
type CartSelectResult = {
	brandGroupList: BrandGroupEntry[];
	cartCoupon: AvailableProductCoupon[];
	productCoupon: AvailableProductForProduct[];
};

export default function CartClient() {
	const { loginOn } = useAuth();

	// 장바구니 리스트 조회
	// invalidateQueries(["cartList"])
	const {
		data: { brandGroupList, cartCoupon, productCoupon } = { brandGroupList: [], cartCoupon: [], productCoupon: [] },
		isLoading,
		isFetching,
	} = useQuery<GetCartResponse, Error, CartSelectResult>({
		queryKey: ["cartList"],
		queryFn: async () => {
			console.log("장바구니 리스트 조회");
			return await getNormal(getApiUrl(API_URL.MY_CART));
		},
		select: (data) => {
			const brandGroup: Record<string, CartItem[]> = {};

			data.cartList.forEach((cart) => {
				// 브랜드별 그룹을 묶기
				if (!brandGroup[cart.sellerName]) brandGroup[cart.sellerName] = [];
				brandGroup[cart.sellerName].push(cart);
			});

			// 각 브랜드 그룹 내 cartItem 정렬: quantity * finalPrice 내림차순
			Object.values(brandGroup).forEach((items) => {
				items.sort((a, b) => {
					const aTotal = a.quantity * a.finalPrice;
					const bTotal = b.quantity * b.finalPrice;
					return bTotal - aTotal;
				});
			});

			return {
				brandGroupList: Object.entries(brandGroup),
				cartCoupon: data.availableCouponsAtCart,
				productCoupon: data.availableCouponsForProduct,
			};
		},
		enabled: loginOn,
		refetchOnWindowFocus: false,
	});

	/* ----------------------------------- */
	const { /* totalCount, */ selectedCount, allSelected, anySelected, unselectedCartIdList, selectedCartIdList } = useMemo(() => {
		const items = brandGroupList.flatMap(([, carts]) => carts);
		const total = items.length;
		const selected = items.filter((c) => c.selected).length;
		const allSelected = total > 0 && selected === total;

		console.log("brandGroupList", brandGroupList);

		return {
			// totalCount: total, // UI에 “3/5 선택” 표시 가능
			selectedCount: selected, // UI에 “3/5 선택” 표시 가능
			allSelected, // 전체 체크박스 checked에 사용
			anySelected: selected > 0, // “하나라도 선택” (예: 삭제 버튼 활성화)
			unselectedCartIdList: items.filter((c) => (allSelected ? true : !c.selected)).map((c) => c.cartId), // 전체 선택 변경을 위한 cartId들
			selectedCartIdList: items.filter((c) => c.selected).map((c) => c.cartId),
		};
	}, [brandGroupList]);

	const CartProductSectionProps = {
		brandGroupList,
		/*  */
		selectedCount,
		allSelected,
		anySelected,
		unselectedCartIdList,
		selectedCartIdList,
	};

	return (
		<main id="cart" className={styles.cart}>
			<div className={styles.cartFrame}>
				<h1 className={`${styles.cartTitle} py-3`}>장바구니</h1>

				<div className={styles.cartWrap}>
					{(isLoading || isFetching) && <LodingWrap />}

					{/* 2열 레이아웃 컨테이너 (grid는 CSS에서) */}
					{/* 좌측: 상품 영역 */}
					<CartProductSection {...CartProductSectionProps} />

					{/* 우측: 요약/혜택/유의사항/CTA */}
					<CartSummaryAside selectedCount={selectedCount} />
				</div>
			</div>
		</main>
	);
}
