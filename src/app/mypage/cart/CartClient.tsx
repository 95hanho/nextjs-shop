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
export type CartCoupon = AvailableProductCoupon & { used: boolean };
export type ProductCoupon = AvailableProductForProduct & { used: boolean };
type CartSelectResult = {
	brandGroupList: BrandGroupEntry[];
	cartCouponList: CartCoupon[];
	productCouponList: ProductCoupon[];
};

export type AppliedCartCoupon = CartCoupon | ProductCoupon;

export type AppliedProductCouponMap = Record<
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
			const cartCouponList: CartCoupon[] = data.availableCouponsAtCart.map((coupon) => {
				return { ...coupon, used: false };
			});
			//
			const productCouponList: ProductCoupon[] = data.availableCouponsForProduct.map((coupon) => {
				return { ...coupon, used: false };
			});
			// 판매자별 나누기
			const availableCouponsWithDiscountObj = productCouponList.reduce(
				(acc, coupon) => {
					if (acc[coupon.sellerName]) acc[coupon.sellerName] = [...acc[coupon.sellerName], coupon];
					else acc[coupon.sellerName] = [coupon];
					return acc;
				},
				{} as Record<string, ProductCoupon[]>,
			);
			// cartId별 적용된 쿠폰 정보 초기값 설정 (초기에는 모든 상품에 쿠폰 미적용 상태로 시작)
			const initialAppliedProductCouponMap: AppliedProductCouponMap = {};

			data.cartList.forEach((cart) => {
				const initPrice = cart.finalPrice * cart.quantity;
				const cartItem: CartItemWithCoupon = { ...cart, discountedPrice: initPrice, discountAmount: 0 };
				if (cart.selected === true) {
					// 쿠폰 적용 정보 초기값 설정
					// 해당 판매자 쿠폰 & 해당 상품 쿠폰 분류하기
					const couponsForSeller =
						availableCouponsWithDiscountObj[cart.sellerName].filter((coupon) => coupon.productId === cart.productId) || [];
					const usedCouponIds: number[] = [];

					// -------- 장바구니 쿠폰 초기 적용 하기 --------
					// 사용 가능한 장바구니 쿠폰 filter
					const availableCartCoupon = [...cartCouponList, ...couponsForSeller].filter((coupon) => {
						return coupon.used === false && calculateDiscount(initPrice, coupon) !== null;
					});

					if (availableCartCoupon.length > 0) {
						// 중복불가 쿠폰 중 최대 할인 1개 + 중복가능 쿠폰 전체
						// 가격이 0원이 되는 경우는 없다고 가정(쿠폰 적용 불가능한 경우는 위에서 걸러졌으므로)
						const selectedUnStackableCoupons = availableCartCoupon.filter((coupon) => !coupon.isStackable);
						const selectedMaxUnStackable = selectedUnStackableCoupons.reduce((max, coupon) => {
							const currentDiscount = calculateDiscount(initPrice, coupon) || 0;
							const maxDiscount = max ? calculateDiscount(initPrice, max) || 0 : 0;

							return currentDiscount > maxDiscount ? coupon : max;
						}, selectedUnStackableCoupons[0] as AppliedCartCoupon);
						const selectedStackableCouponList = availableCartCoupon.filter((coupon) => coupon.isStackable);

						// 사용된 쿠폰 ID 저장
						usedCouponIds.push(selectedMaxUnStackable.couponId, ...selectedStackableCouponList.map((coupon) => coupon.couponId));
						// 사용된 쿠폰 표시
						cartCouponList.forEach((coupon) => {
							if (usedCouponIds.includes(coupon.couponId)) coupon.used = true;
						});
						productCouponList.forEach((coupon) => {
							if (usedCouponIds.includes(coupon.couponId)) coupon.used = true;
						});

						// 보여줄 떄 할인된 가격 계산하기 (UI에서는 할인된 가격 보여주기 위해)
						// const selectedCartCoupon: AppliedCartCoupon[] = [
						// 	...(selectedMaxUnStackable ? [selectedMaxUnStackable] : []),
						// 	...selectedStackableCouponList,
						// ];
						// selectedCartCoupon.forEach((coupon) => {
						// 	const discountAmount = calculateDiscount(initPrice, coupon) || 0;
						// 	cartItem.discountAmount += discountAmount;
						// 	cartItem.discountedPrice -= discountAmount;
						// });

						initialAppliedProductCouponMap[cart.cartId] = {
							unStackable: selectedMaxUnStackable,
							stackable: selectedStackableCouponList,
						};
					}
				}

				// 브랜드별 그룹을 묶기
				if (!brandGroup[cartItem.sellerName]) brandGroup[cartItem.sellerName] = [];
				brandGroup[cartItem.sellerName].push(cartItem);
			});

			setAppliedProductCouponMap(initialAppliedProductCouponMap);

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
	const {
		brandGroupListWithCoupon, // 쿠폰 적용 값 추가
		cartTotalPrice, // 전체 합산 가격 (쿠폰 적용된 가격 기준)
	} = useMemo(() => {
		let cartTotalPrice = 0;

		return {
			brandGroupListWithCoupon: brandGroupList.map(([sellerName, list]) => {
				const productList = list.map((product) => {
					let discountAmount = 0;
					let discountedPrice = product.discountedPrice;

					const appliedProductCoupon = appliedProductCouponMap[product.cartId];

					if (appliedProductCoupon) {
						if (appliedProductCoupon.unStackable) {
							discountAmount += calculateDiscount(product.discountedPrice, appliedProductCoupon.unStackable) || 0;
						}
						if (appliedProductCoupon.stackable.length > 0) {
							appliedProductCoupon.stackable.forEach((coupon) => {
								discountAmount += calculateDiscount(product.discountedPrice, coupon) || 0;
							});
						}
						discountedPrice -= discountAmount;
						cartTotalPrice += discountedPrice; // 전체 합산 가격 계산
					}

					return {
						...product,
						discountAmount,
						discountedPrice,
					};
				});
				return [sellerName, productList] as BrandGroupEntry;
			}) as BrandGroupEntry[],
			cartTotalPrice,
		};
	}, [brandGroupList, appliedProductCouponMap]);

	useEffect(() => {
		// if (cartCouponList.length > 0 || productCouponList.length > 0) console.log({ cartCouponList, productCouponList });
		// if (brandGroupListWithCoupon.length > 0) console.log({ brandGroupListWithCoupon });
		// if (Object.keys(appliedProductCouponMap).length > 0) console.log({ appliedProductCouponMap });
		// console.log({ cartTotalPrice });
	}, [cartCouponList, productCouponList, brandGroupListWithCoupon, appliedProductCouponMap, cartTotalPrice]);

	// =================================================================
	// React
	// =================================================================

	const CartProductSectionProps = {
		brandGroupList: brandGroupListWithCoupon,
		productCouponList,
		cartCouponList,
		appliedProductCouponMap,
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
