"use client";

import { AvailableCartCouponAtCart, AvailableSellerCouponAtCart, CartItem, GetCartResponse } from "@/types/mypage";
import { useQuery } from "@tanstack/react-query";
import API_URL from "@/api/endpoints";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useAuth } from "@/hooks/useAuth";
import { getNormal } from "@/api/fetchFilter";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { LodingWrap } from "@/components/common/LodingWrap";
import Error from "next/error";
import styles from "./CartClient.module.scss";
import CartSummaryAside from "@/app/mypage/cart/CartSummaryAside";
import CartProductSection from "@/app/mypage/cart/CartProductSection";
import { calculateDiscount } from "@/lib/price";
import { useModalStore } from "@/store/modal.store";
import { BuyItem } from "@/types/buy";

type CartItemWithCoupon = CartItem & {
	discountedPrice: number; // 해당 상품에 적용된 쿠폰 할인을 반영한 가격 (finalPrice에서 할인금액을 뺀 가격)
	discountAmount: number; // 해당 상품에 적용된 총 할인 금액
};
export type BrandGroupEntry = [sellerName: string, items: CartItemWithCoupon[]];
export type CartCoupon = AvailableCartCouponAtCart & { used: boolean };
export type SellerCoupon = AvailableSellerCouponAtCart & { used: boolean };

type CartSelectResult = {
	brandGroupList: BrandGroupEntry[];
	cartCouponList: CartCoupon[];
	sellerCouponList: SellerCoupon[];
};
type CartSummaryAsideValue = {
	cartOriginPrice: number; // 장바구니 제품 원래 가격 총합
	cartTotalPrice: number; // 장바구니 최종 가격
	cartSelfDiscount: number; // 장바구니 제품 자체 할인 금액
	cartCouponDiscount: number; // 장바구니 쿠폰의 할인가
	sellerCouponDiscount: number; // 판매자 쿠폰의 할인가
	deliveryFee: number; // 배송비
	//
	buyList: BuyItem[]; // 구매를 위한 상품 리스트 (hold 요청 시 사용)
};

type CartSelectResultWithSummary = CartSelectResult & CartSummaryAsideValue;

export type AppliedCartCoupon = CartCoupon | SellerCoupon;

export type AppliedCoupon = AvailableCartCouponAtCart | AvailableSellerCouponAtCart;
export type AppliedProductCouponMap = Record<
	number, // cartId
	{
		unStackable: AppliedCoupon | null;
		stackable: AppliedCoupon[];
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
	const { openModal } = useModalStore();

	// =================================================================
	// React Query
	// =================================================================

	// 장바구니 리스트 조회
	// invalidateQueries(["cartList"])
	const {
		data: cartData,
		isLoading,
		isFetching,
		dataUpdatedAt,
	} = useQuery<GetCartResponse, Error>({
		queryKey: ["cartList"],
		queryFn: () => getNormal(getApiUrl(API_URL.MY_CART)),
		enabled: loginOn,
		refetchOnWindowFocus: false,
	});

	// =================================================================
	// React
	// =================================================================

	// 마지막으로 초기 자동 적용을 수행한 fetch 시점
	const lastInitAtRef = useRef<number>(0);
	// cartId별 적용된 쿠폰
	const [appliedProductCouponMap, setAppliedProductCouponMap] = useState<AppliedProductCouponMap>({});
	const changeAppliedProductCoupon = (cartId: number, coupon: AppliedCoupon, isChecked: boolean) => {
		userCouponChanged.current = true;
		//
		setAppliedProductCouponMap((prev) => {
			const prevForCart = prev[cartId] || { unStackable: null, stackable: [] };
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
				[cartId]: newForCart,
			};
		});
	};
	const userCouponChanged = useRef<boolean>(false); // 유저 쿠폰 조작 여부 - true에 장바구니 선택 및 옵션변경 시 모달
	const noResetCoupon = useRef<boolean>(false); // 쿠폰 초기화가 불필요 할 때
	const noResetCouponOn = () => {
		noResetCoupon.current = true;
	};

	// =================================================================
	// useEffect, useMemo
	// =================================================================

	// 장바구니 데이터 초기화 및 쿠폰 자동 적용 로직
	useEffect(() => {
		if (!cartData) return;

		// 같은 fetch 결과에는 1번만 수행
		if (lastInitAtRef.current === dataUpdatedAt) return;

		// 쿠폰 초기화가 필요한 경우에만 수행
		if (noResetCoupon.current) {
			console.log("쿠폰 초기화 불필요");
			noResetCoupon.current = false;
			return;
		}

		// 쿠폰 유저 조작이 있었을 시에 자동 적용 로직 수행 전에 알림창 띄우기
		if (userCouponChanged.current) {
			openModal("ALERT", {
				content: "장바구니 쿠폰 적용이 초기화됩니다. 상품 선택 및 옵션 변경 시 쿠폰 적용이 초기화되며, 재적용이 필요합니다.",
			});
			userCouponChanged.current = false;
		}

		// 최초 최대 할인 쿠폰 자동 적용 로직 ==============================================================
		const availableCouponsWithDiscountObj = cartData.availableSellerCoupons.reduce(
			(acc, coupon) => {
				if (acc[coupon.sellerName]) acc[coupon.sellerName] = [...acc[coupon.sellerName], coupon];
				else acc[coupon.sellerName] = [coupon];
				return acc;
			},
			{} as Record<string, AvailableSellerCouponAtCart[]>,
		);

		const initialAppliedProductCouponMap: AppliedProductCouponMap = {};
		const initUsedCouponIds: number[] = [];

		const sortedCartList = [...cartData.cartList].sort((a, b) => b.finalPrice * b.quantity - a.finalPrice * a.quantity); // 할인 전 가격 내림차순

		sortedCartList.forEach((cart) => {
			const initPrice = (cart.finalPrice + cart.addPrice) * cart.quantity;
			if (!cart.selected) return;

			const couponsForCart =
				cartData.availableCartCoupons.filter(
					(coupon) =>
						(coupon.isProductRestricted && coupon.couponAllowedId && coupon.productId === cart.productId) ||
						(!coupon.isProductRestricted && !coupon.couponAllowedId && !coupon.productId),
				) || [];
			const couponsForSeller = availableCouponsWithDiscountObj[cart.sellerName]?.filter((coupon) => coupon.productId === cart.productId) || [];

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
			initialAppliedProductCouponMap[cart.cartId] = {
				unStackable: selectedMaxUnStackable,
				stackable: selectedStackableCouponList,
			};
		});

		// console.log("initialAppliedProductCouponMap", initialAppliedProductCouponMap);
		setAppliedProductCouponMap(initialAppliedProductCouponMap);
		lastInitAtRef.current = dataUpdatedAt; // 초기 적용 완료 시점 기록
	}, [cartData, dataUpdatedAt, openModal, userCouponChanged]);

	// used붙인 쿠폰 리스트 계산
	const {
		// 제품 및 쿠폰
		brandGroupList,
		cartCouponList,
		sellerCouponList,
		// 금액 표시를 위한 값들
		cartOriginPrice,
		cartTotalPrice,
		cartSelfDiscount,
		cartCouponDiscount,
		sellerCouponDiscount,
		deliveryFee,
		// 상품 구매(점유)를 위한
		buyList,
	}: CartSelectResultWithSummary = useMemo(() => {
		// API 응답 전
		if (!cartData) {
			return {
				brandGroupList: [],
				cartCouponList: [],
				sellerCouponList: [],
				cartOriginPrice: 0,
				cartTotalPrice: 0,
				cartSelfDiscount: 0,
				cartCouponDiscount: 0,
				sellerCouponDiscount: 0,
				deliveryFee: 0,
				buyList: [],
			};
		}
		// API 응답 후 / 쿠폰 적용 변경 시
		const brandGroup: Record<string, CartItemWithCoupon[]> = {};
		let cartOriginPrice = 0;
		let cartTotalPrice = 0;
		let cartSelfDiscount = 0;
		let cartCouponDiscount = 0;
		let sellerCouponDiscount = 0;
		const buyList: BuyItem[] = [];

		// 배송비 계산을 위한 객체
		const deliveryInfoBySeller: Record<
			string,
			{
				totalFinalPrice: number; // 해당 판매자 상품들의 자체 할인가 가격 총합
				baseShippingFee: number; // 기본 배송비
				freeShippingMinAmount: number; // 무료배송 최소 주문금액
			}
		> = {};

		cartData.cartList.forEach((cart) => {
			const initPrice = (cart.finalPrice + cart.addPrice) * cart.quantity;
			const cartItem: CartItemWithCoupon = { ...cart, discountedPrice: initPrice, discountAmount: 0 };

			if (cart.selected) {
				const buyCouponIds: number[] = [];

				// 자체할인가 계산
				cartOriginPrice += cart.originPrice * cart.quantity;
				cartSelfDiscount += (cart.originPrice - cart.finalPrice) * cart.quantity;

				// 배송비 계산 정보 저장
				if (!deliveryInfoBySeller[cart.sellerName]) {
					deliveryInfoBySeller[cart.sellerName] = {
						totalFinalPrice: cartItem.finalPrice * cart.quantity,
						baseShippingFee: cart.baseShippingFee,
						freeShippingMinAmount: cart.freeShippingMinAmount,
					};
				} else {
					deliveryInfoBySeller[cart.sellerName].totalFinalPrice += cartItem.finalPrice * cart.quantity;
				}

				// 적용 쿠폰에 따라 discountedPrice와 discountAmount 계산
				const appliedProductCoupon = appliedProductCouponMap[cartItem.cartId];
				if (appliedProductCoupon) {
					if (appliedProductCoupon.unStackable) {
						const unStackableDiscount = calculateDiscount(cartItem.discountedPrice, appliedProductCoupon.unStackable) || 0;
						cartItem.discountAmount += unStackableDiscount;
						if ("sellerName" in appliedProductCoupon.unStackable) {
							sellerCouponDiscount += unStackableDiscount;
						} else {
							cartCouponDiscount += unStackableDiscount;
						}
						// 구매 쿠폰 추가(중복 불가능)
						buyCouponIds.push(appliedProductCoupon.unStackable.couponId);
					}
					if (appliedProductCoupon.stackable.length > 0) {
						appliedProductCoupon.stackable.forEach((coupon) => {
							const stackableDiscount = calculateDiscount(cartItem.discountedPrice, coupon) || 0;
							cartItem.discountAmount += stackableDiscount;
							if ("sellerName" in coupon) sellerCouponDiscount += stackableDiscount;
							else cartCouponDiscount += stackableDiscount;
						});
						// 구매 쿠폰 추가(중복 가능)
						buyCouponIds.push(...appliedProductCoupon.stackable.map((c) => c.couponId));
					}
					cartItem.discountedPrice -= cartItem.discountAmount;
				}
				cartTotalPrice += cartItem.discountedPrice; // 전체 합산 가격 계산

				// 구매를 위한 buyList 구성
				buyList.push({
					productOptionId: cartItem.productOptionId,
					cartId: cartItem.cartId,
					count: cartItem.quantity,
					couponIds: buyCouponIds,
				});
			}

			// 판매자(브랜드)별로 장바구니 상품 그룹핑
			if (!brandGroup[cartItem.sellerName]) brandGroup[cartItem.sellerName] = [];
			brandGroup[cartItem.sellerName].push(cartItem);
		});

		const usedSet = new Set<number>();
		Object.values(appliedProductCouponMap).forEach((applied) => {
			if (applied?.unStackable) {
				usedSet.add(applied.unStackable.couponId);
			}
			applied?.stackable.forEach((coupon) => usedSet.add(coupon.couponId));
		});

		return {
			brandGroupList: Object.entries(brandGroup),
			cartCouponList: cartData.availableCartCoupons.map((coupon) => ({
				...coupon,
				used: usedSet.has(coupon.couponId),
			})),
			sellerCouponList: cartData.availableSellerCoupons.map((coupon) => ({
				...coupon,
				used: usedSet.has(coupon.couponId),
			})),
			cartOriginPrice,
			cartTotalPrice,
			cartSelfDiscount,
			cartCouponDiscount,
			sellerCouponDiscount,
			deliveryFee: Object.values(deliveryInfoBySeller).reduce((fee, { totalFinalPrice, baseShippingFee, freeShippingMinAmount }) => {
				return fee + (totalFinalPrice >= freeShippingMinAmount ? 0 : baseShippingFee);
			}, 0),
			buyList,
		};
	}, [cartData, appliedProductCouponMap]);

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

	// 장바구니 내 상품 중 재고 수량보다 주문 수량이 초과된 상품이 있는지 여부에 따른 모달 띄우기
	useEffect(() => {
		if (cartData && cartData.isExceedQuantity) {
			openModal("ALERT", {
				content: "장바구니 내 상품 중 재고 수량보다 주문 수량이 초과된 상품이 있습니다. 주문 수량을 확인해주세요.",
			});
		}
	}, [openModal, cartData]);

	useEffect(() => {
		if (cartCouponList.length > 0) console.log({ cartCouponList });
		if (sellerCouponList.length > 0) console.log({ sellerCouponList });
		// if (Object.keys(appliedProductCouponMap).length > 0) console.log({ appliedProductCouponMap });
		// console.log({ cartTotalPrice, cartSelfDiscount, cartCouponDiscount, sellerCouponDiscount });
		// console.log({ deliveryFee });
	}, [
		cartCouponList,
		sellerCouponList,
		appliedProductCouponMap,
		cartTotalPrice,
		cartSelfDiscount,
		cartCouponDiscount,
		sellerCouponDiscount,
		deliveryFee,
	]);

	// =================================================================
	// UI
	// =================================================================

	const CartProductSectionProps = {
		noResetCouponOn,
		//
		brandGroupList,
		cartCouponList,
		sellerCouponList,
		appliedProductCouponMap,
		changeAppliedProductCoupon,
		/*  */
		selectedCount,
		allSelected,
		anySelected,
		unselectedCartIdList,
		selectedCartIdList,
	};

	const CartSummaryAsideProps = {
		cartOriginPrice,
		cartTotalPrice,
		cartSelfDiscount, // 장바구니 제품 자체 할인 금액
		cartCouponDiscount, // 장바구니 쿠폰의 할인가
		sellerCouponDiscount, // 판매자 쿠폰의 할인가
		deliveryFee,
		//
		selectedCount,
		//
		buyList,
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
					<CartSummaryAside {...CartSummaryAsideProps} />
				</div>
			</div>
		</main>
	);
}
