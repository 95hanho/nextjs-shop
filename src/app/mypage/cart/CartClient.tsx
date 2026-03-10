"use client";

import { AvailableProductForProduct, CartItem, GetCartResponse } from "@/types/mypage";
import { AvailableProductCoupon } from "@/types/product";
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
import { calculateDiscount } from "@/lib/price";

type CartItemWithCoupon = CartItem & {
	discountedPrice: number; // 해당 상품에 적용된 쿠폰 할인을 반영한 가격 (finalPrice에서 할인금액을 뺀 가격)
	discountAmount: number; // 해당 상품에 적용된 총 할인 금액
};
export type BrandGroupEntry = [sellerName: string, items: CartItemWithCoupon[]];
type CartCouponList = AvailableProductCoupon & { used: boolean };
type ProductCouponList = AvailableProductForProduct & { used: boolean };
type CartSelectResult = {
	brandGroupList: BrandGroupEntry[];
	cartCouponList: CartCouponList[];
	productCouponList: ProductCouponList[];
};

type AppliedCartCoupon = CartCouponList | ProductCouponList;

type AppliedProductCouponMap = Record<
	number, // cartId
	{
		unStackable: AppliedCartCoupon | null;
		stackable: AppliedCartCoupon[];
	}
>;

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
			// 초기화
			const cartCouponList: CartCouponList[] = data.availableCouponsAtCart.map((coupon) => {
				return { ...coupon, used: false };
			});
			const productCouponList: ProductCouponList[] = data.availableCouponsForProduct.map((coupon) => {
				return { ...coupon, used: false };
			});
			// 판매자별 나누기
			const availableCouponsWithDiscountObj = productCouponList.reduce(
				(acc, coupon) => {
					if (acc[coupon.sellerName]) acc[coupon.sellerName] = [...acc[coupon.sellerName], coupon];
					else acc[coupon.sellerName] = [coupon];
					return acc;
				},
				{} as Record<string, ProductCouponList[]>,
			);

			data.cartList.forEach((cart) => {
				// 쿠폰 적용 정보 초기값 설정
				const totalPrice = cart.finalPrice * cart.quantity;
				const cartItem: CartItemWithCoupon = { ...cart, discountedPrice: totalPrice, discountAmount: 0 };
				const couponsForSeller = availableCouponsWithDiscountObj[cart.sellerName] || [];
				const usedCouponIds = [];

				// -------- 장바구니 쿠폰 초기 적용 하기 --------
				// 사용 가능한 장바구니 쿠폰 filter
				const availableCartCoupon = [...cartCouponList, ...couponsForSeller].filter((coupon) => {
					return coupon.used === false && calculateDiscount(totalPrice, coupon) !== null;
				});

				if (availableCartCoupon.length > 0) {
					// 중복불가 쿠폰 중 최대 할인 1개 + 중복가능 쿠폰 전체
					// 가격이 0원이 되는 경우는 없다고 가정(쿠폰 적용 불가능한 경우는 위에서 걸러졌으므로)
					const selectedUnStackableCoupons = availableCartCoupon.filter((coupon) => !coupon.isStackable);
					const selectedMaxUnStackable = selectedUnStackableCoupons.reduce((max, coupon) => {
						const currentDiscount = calculateDiscount(totalPrice, coupon) || 0;
						const maxDiscount = max ? calculateDiscount(totalPrice, max) || 0 : 0;

						return currentDiscount > maxDiscount ? coupon : max;
					}, selectedUnStackableCoupons[0] as AppliedCartCoupon);
					const selectedStackableCouponList = availableCartCoupon.filter((coupon) => coupon.isStackable);

					usedCouponIds.push(selectedMaxUnStackable.couponId, ...selectedStackableCouponList.map((coupon) => coupon.couponId));

					// 보여줄 떄 할인된 가격 계산하기 (UI에서는 할인된 가격 보여주기 위해)
					// const selectedCartCouponList: AppliedCartCoupon[] = [
					// 	...(selectedMaxUnStackable ? [selectedMaxUnStackable] : []),
					// 	...selectedStackableCouponList,
					// ];
					// selectedCartCouponList.forEach((coupon) => {
					// 	const discountAmount = calculateDiscount(totalPrice, coupon) || 0;
					// 	cartItem.discountAmount += discountAmount;
					// 	cartItem.discountedPrice -= discountAmount;
					// });

					setAppliedProductCouponMap((prev) => ({
						...prev,
						[cart.cartId]: {
							unStackable: selectedMaxUnStackable,
							stackable: selectedStackableCouponList,
						},
					}));
				}

				// 브랜드별 그룹을 묶기
				if (!brandGroup[cartItem.sellerName]) brandGroup[cartItem.sellerName] = [];
				brandGroup[cartItem.sellerName].push(cartItem);
			});

			// 각 브랜드 그룹 내 cartItem 정렬: quantity * finalPrice 내림차순
			/*
			이미 정렬된 데이터가 온다함. 필요한 데서는 쓰기
			Object.values(brandGroup).forEach((items) => {
				items.sort((a, b) => {
					const aTotal = a.quantity * a.finalPrice;
					const bTotal = b.quantity * b.finalPrice;
					return bTotal - aTotal;
				});
			});
			*/

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

	// cartId별 적용된 쿠폰
	const [appliedProductCouponMap, setAppliedProductCouponMap] = useState<AppliedProductCouponMap>({});

	// 선택된 쿠폰에 따른 가격 계산만 해줌.(일단 나중에)
	const brandGroupListWithCoupon = useMemo(() => {
		return brandGroupList;
	}, [brandGroupList]);

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
