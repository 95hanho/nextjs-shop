"use client";

import { AvailableProductForProduct, CartItem, GetCartResponse } from "@/types/mypage";
import { useQuery } from "@tanstack/react-query";
import API_URL from "@/api/endpoints";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useAuth } from "@/hooks/useAuth";
import { getNormal } from "@/api/fetchFilter";
import React, { useEffect, useMemo, useState } from "react";
import { LodingWrap } from "@/components/common/LodingWrap";
import Error from "next/error";
import styles from "./CartClient.module.scss";
import CartSummaryAside from "@/app/mypage/cart/CartSummaryAside";
import CartProductSection from "@/app/mypage/cart/CartProductSection";
import { AvailableProductCoupon } from "@/types/product";
import { calculateDiscount } from "@/lib/price";

type CartItemWithCoupon = CartItem & {
	appliedCouponList: ProductCoupon[]; // 해당 상품에 적용된 쿠폰 리스트
	discountAmount: number; // 해당 상품에 적용된 총 할인 금액
};
export type BrandGroupEntry = [sellerName: string, items: CartItemWithCoupon[]];
type CartCoupon = AvailableProductCoupon & { used: boolean };
type ProductCoupon = AvailableProductForProduct & { used: boolean };
type SelectedCouponKeysByCart = Record<number, string[]>;
type CartSelectResult = {
	brandGroupList: BrandGroupEntry[];
	cartCouponList: CartCoupon[];
	productCouponList: ProductCoupon[];
};

const getCouponKey = (coupon: Pick<ProductCoupon, "userCouponId" | "couponId" | "sellerName" | "productId">) =>
	`${coupon.userCouponId ?? "null"}:${coupon.couponId}:${coupon.sellerName}:${coupon.productId}`;

export type CartItemSelectCollection = {
	selectedCount: number;
	allSelected: boolean;
	anySelected: boolean;
	unselectedCartIdList: number[];
	selectedCartIdList: number[];
};

export default function CartClient() {
	const { loginOn } = useAuth();

	// =================================================================
	// React Query
	// =================================================================

	// 장바구니 리스트 조회
	// invalidateQueries(["cartList"])
	const {
		data: { brandGroupList, cartCouponList, productCouponList } = { brandGroupList: [], cartCouponList: [], productCouponList: [] },
		isLoading,
		isFetching,
	} = useQuery<GetCartResponse, Error, CartSelectResult>({
		queryKey: ["cartList"],
		queryFn: () => getNormal(getApiUrl(API_URL.MY_CART)),
		select: (data) => {
			const brandGroup: Record<string, CartItemWithCoupon[]> = {};

			data.cartList.forEach((cart) => {
				// 쿠폰 적용 정보 초기값 설정
				const cartItem: CartItemWithCoupon = { ...cart, appliedCouponList: [], discountAmount: 0 };
				// 브랜드별 그룹을 묶기
				if (!brandGroup[cartItem.sellerName]) brandGroup[cartItem.sellerName] = [];
				brandGroup[cartItem.sellerName].push(cartItem);
			});

			// 각 브랜드 그룹 내 cartItem 정렬: quantity * finalPrice 내림차순
			Object.values(brandGroup).forEach((items) => {
				items.sort((a, b) => {
					const aTotal = a.quantity * a.finalPrice;
					const bTotal = b.quantity * b.finalPrice;
					return bTotal - aTotal;
				});
			});

			const cartCouponList = data.availableCouponsAtCart.map((coupon) => {
				return { ...coupon, used: false };
			});
			const productCouponList = data.availableCouponsForProduct.map((coupon) => {
				return { ...coupon, used: false };
			});

			return {
				brandGroupList: Object.entries(brandGroup),
				cartCouponList,
				productCouponList,
			};
		},
		enabled: loginOn,
		refetchOnWindowFocus: false,
	});

	// =================================================================
	// React
	// =================================================================

	/* ----------------------------------- */

	// 장바구니 상품 선택 관련
	const { /* totalCount, */ selectedCount, allSelected, anySelected, unselectedCartIdList, selectedCartIdList }: CartItemSelectCollection =
		useMemo(() => {
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

	// cartId별 사용자가 명시적으로 선택한 쿠폰 키 목록
	const [selectedCouponKeysByCart, setSelectedCouponKeysByCart] = useState<SelectedCouponKeysByCart>({});

	// 서버 데이터 변경 시, 존재하지 않는 cartId/couponKey 선택값을 정리한다.
	useEffect(() => {
		const availableCouponKeySet = new Set(productCouponList.map((coupon) => getCouponKey(coupon)));
		const availableCartIdSet = new Set(brandGroupList.flatMap(([, items]) => items.map((item) => item.cartId)));

		setSelectedCouponKeysByCart((prev) => {
			const next: SelectedCouponKeysByCart = {};
			let changed = false;

			Object.entries(prev).forEach(([cartIdRaw, couponKeys]) => {
				const cartId = Number(cartIdRaw);
				if (!availableCartIdSet.has(cartId)) {
					changed = true;
					return;
				}

				const filteredKeys = couponKeys.filter((couponKey) => availableCouponKeySet.has(couponKey));
				if (filteredKeys.length !== couponKeys.length) changed = true;
				if (filteredKeys.length > 0) next[cartId] = filteredKeys;
			});

			return changed ? next : prev;
		});
	}, [brandGroupList, productCouponList]);

	// 쿠폰 선택된 상품
	const brandGroupListWithCoupon = useMemo(() => {
		const availableCouponsWithDiscountObj = productCouponList.reduce(
			(acc, coupon) => {
				if (acc[coupon.sellerName]) acc[coupon.sellerName] = [...acc[coupon.sellerName], coupon];
				else acc[coupon.sellerName] = [coupon];
				return acc;
			},
			{} as Record<string, ProductCoupon[]>,
		);

		return brandGroupList.map(([sellerName, items]) => {
			// 해당 판매자 쿠폰을 복사해서 아이템 순회 중 used 상태를 반영한다.
			const couponsForSeller = (availableCouponsWithDiscountObj[sellerName] || []).map((coupon) => ({ ...coupon }));

			// 적용가능 쿠폰 없으면
			if (couponsForSeller.length === 0) return [sellerName, items] as BrandGroupEntry;

			const itemsWithDiscount = items.map((item) => {
				const appliedCouponList: ProductCoupon[] = [];
				const selectedCouponKeys = selectedCouponKeysByCart[item.cartId] || [];
				const selectedCouponKeySet = new Set(selectedCouponKeys);

				if (selectedCouponKeys.length > 0) {
					// 사용자 선택이 있으면 선택한 쿠폰만 우선 적용한다.
					const userSelectedCoupons = couponsForSeller.filter((coupon) => {
						if (coupon.used) return false;
						if (!selectedCouponKeySet.has(getCouponKey(coupon))) return false;
						return calculateDiscount(item.finalPrice * item.quantity, coupon) !== null;
					});

					const selectedUnStackableCoupons = userSelectedCoupons.filter((coupon) => !coupon.isStackable);
					const selectedMaxUnStackable = selectedUnStackableCoupons.reduce(
						(max, coupon) => {
							const currentDiscount = calculateDiscount(item.finalPrice * item.quantity, coupon) || 0;
							const maxDiscount = max ? calculateDiscount(item.finalPrice * item.quantity, max) || 0 : 0;

							return currentDiscount > maxDiscount ? coupon : max;
						},
						null as ProductCoupon | null,
					);
					const selectedStackableCouponList = userSelectedCoupons.filter((coupon) => coupon.isStackable);

					appliedCouponList.push(...(selectedMaxUnStackable ? [selectedMaxUnStackable] : []), ...selectedStackableCouponList);
				} else {
					// 사용자 선택이 없으면 자동 적용 정책을 사용한다.
					const availableCouponsWithDiscount = couponsForSeller.filter(
						(coupon) => !coupon.used && calculateDiscount(item.finalPrice * item.quantity, coupon) !== null,
					);

					const unStackableCoupons = availableCouponsWithDiscount.filter((coupon) => !coupon.isStackable);
					const maxUnStackable = unStackableCoupons.reduce(
						(max, coupon) => {
							const currentDiscount = calculateDiscount(item.finalPrice * item.quantity, coupon) || 0;
							const maxDiscount = max ? calculateDiscount(item.finalPrice * item.quantity, max) || 0 : 0;

							return currentDiscount > maxDiscount ? coupon : max;
						},
						null as ProductCoupon | null,
					);
					const stackableCouponList = availableCouponsWithDiscount.filter((coupon) => coupon.isStackable);

					appliedCouponList.push(...(maxUnStackable ? [maxUnStackable] : []), ...stackableCouponList);
				}

				let discountAmount = 0;
				appliedCouponList.forEach((coupon) => {
					discountAmount += calculateDiscount(item.finalPrice * item.quantity, coupon) as number;
				});

				// 이번 아이템에 사용된 쿠폰을 사용 처리하여 다음 아이템에서는 재사용되지 않게 한다.
				appliedCouponList.forEach((usedCoupon) => {
					const target = couponsForSeller.find((coupon) => coupon.couponId === usedCoupon.couponId);
					if (target) target.used = true;
				});

				return {
					...item,
					appliedCouponList,
					discountAmount,
				};
			});

			return [sellerName, itemsWithDiscount] as BrandGroupEntry;
		});
	}, [brandGroupList, productCouponList, selectedCouponKeysByCart]);

	useEffect(() => {
		// console.log({ cartCouponList, productCouponList });
		console.log({ brandGroupListWithCoupon });
	}, [cartCouponList, productCouponList, brandGroupListWithCoupon]);

	// =================================================================
	// React
	// =================================================================

	const CartProductSectionProps = {
		brandGroupList: brandGroupListWithCoupon,
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
