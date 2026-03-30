"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Buy.module.scss";
import OrderFormSection from "@/app/buy/OrderFormSection";
import OrderSummaryPanel from "@/app/buy/OrderSummaryPanel";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getNormal, postJson, putJson } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import {
	AvailableCartCouponAtBuy,
	AvailableSellerCouponAtBuy,
	GetStockHoldResponse,
	ManageBuyHoldCouponRequest,
	ManageHoldCoupon,
	StockHoldProduct,
} from "@/types/buy";
import { useAuth } from "@/hooks/useAuth";
import { BuyProvider } from "@/providers/buy/BuyProvider";
import { calculateDiscount } from "@/lib/price";
import { useRouter } from "next/navigation";
import { useModalStore } from "@/store/modal.store";
import { toErrorResponse } from "@/api/error";

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
	const router = useRouter();
	const { openModal } = useModalStore();

	// =================================================================
	// React Query
	// =================================================================

	// 점유한 상품 조회
	// invalidateQueries(["stockHold"])
	const {
		data: stockHoldData,
		isError,
		isLoading,
		error,
	} = useQuery<GetStockHoldResponse, Error>({
		queryKey: ["stockHold"],
		queryFn: () => getNormal(getApiUrl(API_URL.BUY_PAY)),
		enabled: loginOn,
		refetchOnWindowFocus: false,
		retry: false,
	});

	// 점유 연장 handleStockHoldExtend
	const { mutateAsync: handleStockHoldExtend } = useMutation({
		mutationFn: () => postJson(getApiUrl(API_URL.BUY_HOLD_EXTEND), {}),
		onSuccess() {},
		onError(err) {
			console.log("handleStockHoldExtend err", err);
		},
	});
	// 점유 쿠폰 추가 handleAddBuyHoldCoupon
	const { mutateAsync: handleAddBuyHoldCoupon } = useMutation({
		mutationFn: (data: ManageBuyHoldCouponRequest) => postJson(getApiUrl(API_URL.BUY_HOLD_COUPON), data),
		onSuccess() {},
		onError(err) {
			console.log("handleAddBuyHoldCoupon err", err);
		},
	});
	// 점유 쿠폰 삭제 handleDeleteBuyHoldCoupon
	const { mutateAsync: handleDeleteBuyHoldCoupon } = useMutation({
		mutationFn: (data: ManageBuyHoldCouponRequest) => putJson(getApiUrl(API_URL.BUY_HOLD_COUPON), data),
		onSuccess() {},
		onError(err) {
			console.log("handleDeleteBuyHoldCoupon err", err);
		},
	});

	// =================================================================
	// React
	// =================================================================

	// 점유 연장 가능한지
	const canExtendHold = loginOn && !!stockHoldData && !isError && !isLoading;
	// 점유 연장 중복 방지용 Ref (inFlightRef가 true면 점유 연장 요청이 진행 중이므로 새로운 요청을 보내지 않음)
	const inFlightRef = useRef(false);
	// 처음 계산한 최대할인 쿠폰 저장
	const maxDiscountAppliedProductCouponMapRef = useRef<AppliedProductCouponMap>({});
	// 최대할인 쿠폰의 할인 값 저장
	const maxDiscountPrice = useRef<number>(0);
	// 적용된 쿠폰(holdId별)
	const [appliedProductCouponMap, setAppliedProductCouponMap] = useState<AppliedProductCouponMap>({});
	const changeAppliedProductCoupon = async (holdId: number, coupon: AppliedCoupon, isChecked: boolean) => {
		// console.log("[changeAppliedProductCoupon]", { holdId, coupon, isChecked });
		const toDelete: ManageHoldCoupon[] = [];
		const toAdd: ManageHoldCoupon[] = [];

		const prevForCart = appliedProductCouponMap[holdId] || { unStackable: null, stackable: [] };
		let newForCart: { unStackable: AppliedCoupon | null; stackable: AppliedCoupon[] };
		if (isChecked) {
			// 쿠폰 적용
			if (coupon.isStackable) {
				newForCart = {
					...prevForCart,
					stackable: [...prevForCart.stackable, coupon],
				};
				toAdd.push({ holdId, userCouponId: coupon.userCouponId });
			} else {
				newForCart = {
					...prevForCart,
					unStackable: coupon,
				};
				if (prevForCart.unStackable) {
					toDelete.push({ holdId, userCouponId: prevForCart.unStackable.userCouponId }); // 기존에 적용된 중복 불가능 쿠폰이 있으면 삭제
				}
				toAdd.push({ holdId, userCouponId: coupon.userCouponId });
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
			toDelete.push({ holdId, userCouponId: coupon.userCouponId });
		}
		setAppliedProductCouponMap((prev) => ({
			...prev,
			[holdId]: newForCart,
		}));
		// 점유 쿠폰 추가/삭제 handleBuyHoldCoupon 호출
		// 쿠폰 삭제
		if (toDelete.length > 0) {
			await handleDeleteBuyHoldCoupon({
				holdCoupons: toDelete,
			});
		}
		// 쿠폰 추가
		if (toAdd.length > 0) {
			await handleAddBuyHoldCoupon({
				holdCoupons: toAdd,
			});
		}
	};
	// 최대 할인 쿠폰 적용하기
	type AppliedCouponWishHoldId = AppliedCoupon & { holdId: number };
	const changeMaxDiscountApplied = async () => {
		setAppliedProductCouponMap(maxDiscountAppliedProductCouponMapRef.current);
		// 최대 할인 쿠폰에 포함되는거와 포함되지않는거 찾기
		const maxCoupons = Object.entries(maxDiscountAppliedProductCouponMapRef.current).reduce((coupons, [holdId, couponMap]) => {
			if (couponMap.unStackable) coupons.push({ ...couponMap.unStackable, holdId: Number(holdId) });
			coupons.push(...couponMap.stackable.map((c) => ({ ...c, holdId: Number(holdId) })));
			return coupons;
		}, [] as AppliedCouponWishHoldId[]);
		const curCoupons = Object.entries(appliedProductCouponMap).reduce((coupons, [holdId, couponMap]) => {
			if (couponMap.unStackable) coupons.push({ ...couponMap.unStackable, holdId: Number(holdId) });
			coupons.push(...couponMap.stackable.map((c) => ({ ...c, holdId: Number(holdId) })));
			return coupons;
		}, [] as AppliedCouponWishHoldId[]);
		// 삭제
		const toDelete = curCoupons.filter((cc) => !maxCoupons.some((mc) => mc.couponId === cc.couponId && mc.holdId === cc.holdId));
		// 추가
		const toAdd = maxCoupons.filter((mc) => !curCoupons.some((cc) => cc.couponId === mc.couponId && cc.holdId === mc.holdId));
		// API 호출 삭제
		if (toDelete.length > 0) {
			await handleDeleteBuyHoldCoupon({
				holdCoupons: toDelete.map((coupon) => ({
					holdId: coupon.holdId,
					userCouponId: coupon.userCouponId,
				})),
			});
		}
		// API 호출 추가
		if (toAdd.length > 0) {
			await handleAddBuyHoldCoupon({
				holdCoupons: toAdd.map((coupon) => ({
					holdId: coupon.holdId,
					userCouponId: coupon.userCouponId,
				})),
			});
		}
	};

	// =================================================================
	// useEffect, useMemo
	// =================================================================

	// 점유 조회, 점유 연장 에러 처리
	useEffect(() => {
		if (!isError || !error) return;

		const { payload } = toErrorResponse(error);

		// 해당 계정으로 점유 자체가 없을 경우 | 일반적으로 점유해제된 경우
		// => 메인페이지로
		if (payload.message === "NO_ACTIVE_HOLDS") {
			openModal("ALERT", {
				content: "구매 중인 상품 정보가 없습니다. 메인 페이지로 이동합니다.",
				handleAfterClose: () => {
					router.replace("/");
				},
			});
			return;
		}
		if (payload.message === "ALREADY_PAID_HOLD") {
			openModal("ALERT", {
				content: "이미 완료된 결제입니다. 메인 페이지로 이동합니다.",
				handleAfterClose: () => {
					router.replace("/");
				},
			});
			return;
		}

		if (payload.message === "HOLD_EXPIRED" || payload.message === "PRODUCT_SALE_STOPPED" || payload.message === "SELLER_UNAVAILABLE") {
			let message = "";
			if (payload.message === "HOLD_EXPIRED") message = "세션이 만료되었습니다. 결제를 다시 진행해주세요.";
			else if (payload.message === "PRODUCT_SALE_STOPPED") message = "세션이 만료되었습니다. 결제를 다시 진행해주세요.";
			else if (payload.message === "SELLER_UNAVAILABLE") message = "세션이 만료되었습니다. 결제를 다시 진행해주세요.";

			openModal("ALERT", {
				content: message,
				handleAfterClose: () => {
					router.replace(payload.detail as string);
				},
			});
			return;
		}

		openModal("ALERT", {
			content: "알 수 없는 오류가 발생했습니다. 다시 시도해주세요.",
			handleAfterClose: () => {
				router.replace("/");
			},
		});
	}, [isError, error, openModal, router]);
	// 1분마다 구매상품 점유 연장 시도 (구매페이지에 진입한 후 1분마다 연장 시도)
	useEffect(() => {
		if (!canExtendHold) return;

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
		// tick();

		return () => window.clearInterval(id);
	}, [handleStockHoldExtend, canExtendHold]);
	// 탭이 활성화될 때마다 구매상품 점유 연장 시도 (사용자가 탭을 다시 볼 때마다 연장 시도)
	useEffect(() => {
		const onVisible = async () => {
			if (document.hidden || !canExtendHold || inFlightRef.current) return;

			inFlightRef.current = true;
			try {
				await handleStockHoldExtend();
			} finally {
				inFlightRef.current = false;
			}
		};

		document.addEventListener("visibilitychange", onVisible);
		return () => document.removeEventListener("visibilitychange", onVisible);
	}, [canExtendHold, handleStockHoldExtend]);
	// 최대 할인쿠폰 저장 및 초기 쿠폰을 통한 적용 쿠폰 저장.
	useEffect(() => {
		if (!stockHoldData) return;
		// console.log("최대 할인쿠폰 저장 및 초기 쿠폰을 통한 적용 쿠폰 저장.");

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
		let initMaxDiscountPrice = 0;
		const initUsedCouponIds: number[] = [];
		const userCopponIdToCouponMap: Record<number, AvailableCartCouponAtBuy | AvailableSellerCouponAtBuy> = {};
		[...stockHoldData.availableCartCoupons, ...stockHoldData.availableSellerCoupons].forEach((coupon) => {
			userCopponIdToCouponMap[coupon.userCouponId] = coupon;
		});

		const sortedStockHoldProductList = [...stockHoldData.stockHoldProductList].sort((a, b) => b.finalPrice * b.count - a.finalPrice * a.count); // 할인 전 가격 내림차순

		sortedStockHoldProductList.forEach((product) => {
			const initialFinalPrice = (product.finalPrice + product.addPrice) * product.count;
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
						((coupon.isProductRestricted && coupon.couponAllowedId && coupon.productId === product.productId) ||
							(!coupon.isProductRestricted && !coupon.couponAllowedId)) &&
						calculateDiscount(initialFinalPrice, coupon) !== null,
				) || [];
			const couponsForSeller =
				availableCouponsWithDiscountObj[product.sellerName]?.filter(
					(coupon) =>
						((coupon.isProductRestricted && coupon.couponAllowedId && coupon.productId === product.productId) ||
							(!coupon.isProductRestricted && !coupon.couponAllowedId)) &&
						calculateDiscount(initialFinalPrice, coupon) !== null,
				) || [];

			// 사용가능 쿠폰
			const availableBuyCoupon = [...couponsForCart, ...couponsForSeller];

			const availableMaxDiscountBuyCoupon = availableBuyCoupon.filter((coupon) => {
				return !initUsedCouponIds.includes(coupon.couponId);
			});
			if (availableMaxDiscountBuyCoupon.length > 0) {
				const selectedUnStackableCoupons = availableMaxDiscountBuyCoupon.filter((coupon) => !coupon.isStackable);
				const selectedMaxUnStackable = selectedUnStackableCoupons.reduce((max, coupon) => {
					const currentDiscount = calculateDiscount(initialFinalPrice, coupon) || 0;
					const maxDiscount = max ? calculateDiscount(initialFinalPrice, max) || 0 : 0;

					return currentDiscount > maxDiscount ? coupon : max;
				}, selectedUnStackableCoupons[0] as AppliedCoupon);
				const selectedStackableCouponList = availableMaxDiscountBuyCoupon.filter((coupon) => coupon.isStackable);

				initMaxDiscountAppliedProductCouponMap[product.holdId] = {
					unStackable: selectedMaxUnStackable,
					stackable: selectedStackableCouponList,
				};

				if (selectedMaxUnStackable) {
					initUsedCouponIds.push(selectedMaxUnStackable.couponId);
					initMaxDiscountPrice += calculateDiscount(initialFinalPrice, selectedMaxUnStackable) || 0;
				}
				initUsedCouponIds.push(...selectedStackableCouponList.map((coupon) => coupon.couponId));
				initMaxDiscountPrice += selectedStackableCouponList.reduce(
					(sum, coupon) => sum + (calculateDiscount(initialFinalPrice, coupon) || 0),
					0,
				);
			}
		});

		// console.log({ initialAppliedProductCouponMap /* initMaxDiscountAppliedProductCouponMap */ });
		// 초기 적용 쿠폰 저장
		setAppliedProductCouponMap(initialAppliedProductCouponMap);
		// 최대 할인 쿠폰 저장
		maxDiscountAppliedProductCouponMapRef.current = initMaxDiscountAppliedProductCouponMap;
		maxDiscountPrice.current = initMaxDiscountPrice;
	}, [stockHoldData]);

	const {
		buyItemList, // 구매 상품 리스트 (쿠폰 할인 반영된 가격과 할인 금액 포함)
		defaultAddress, // 기본 배송지 정보
		cartCouponList, // 장바구니 쿠폰 리스트 (사용 여부 포함)
		sellerCouponList, // 판매자 쿠폰 리스트 (사용 여부 포함)
		isMaxDiscountApplied, // 최대 할인 쿠폰이 적용됐는지 여부
		// 금액 표시 위해 계산된 값들
		buyTotalOriginPrice, // 할인 전 총 상품 가격 (addPrice, count 반영된 가격)
		buyTotalFinalPrice, // 할인 후 총 상품 가격 (addPrice, count, 쿠폰 할인 반영된 가격)
		buySelfDiscount, // 자체 할인가
		cartCouponDiscount, // 장바구니쿠폰 할인가
		sellerCouponDiscount, // 판매자쿠폰 할인가
		deliveryFee, // 배송비
		//
		holdIds, // 구매 상품들의 holdId 리스트
	} = useMemo(() => {
		// API 응답 전
		if (!stockHoldData) {
			return {
				buyItemList: [],
				defaultAddress: null,
				cartCouponList: [],
				sellerCouponList: [],
				isMaxDiscountApplied: false,
				buyTotalOriginPrice: 0,
				buyTotalFinalPrice: 0,
				buySelfDiscount: 0,
				cartCouponDiscount: 0,
				sellerCouponDiscount: 0,
				deliveryFee: 0,
				holdIds: [],
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

		stockHoldData.stockHoldProductList.forEach((stockHold) => {
			const initPrice = (stockHold.finalPrice + stockHold.addPrice) * stockHold.count;
			const buyItem: BuyItemWishCoupon = {
				...stockHold,
				discountedPrice: initPrice,
				discountAmount: 0,
			};

			// 자체할인가 계산
			buyTotalOriginPrice += stockHold.originPrice * stockHold.count;
			buySelfDiscount += (stockHold.originPrice - stockHold.finalPrice) * stockHold.count;

			// 배송비 계산 정보 저장
			if (!deliveryInfoBySeller[stockHold.sellerName]) {
				deliveryInfoBySeller[stockHold.sellerName] = {
					totalFinalPrice: buyItem.finalPrice * buyItem.count,
					baseShippingFee: stockHold.baseShippingFee,
					freeShippingMinAmount: stockHold.freeShippingMinAmount,
				};
			} else {
				deliveryInfoBySeller[stockHold.sellerName].totalFinalPrice += buyItem.finalPrice * buyItem.count;
			}

			// 적용 쿠폰에 따라 discountedPrice와 discountAmount 계산
			const appliedProductCoupon = appliedProductCouponMap[stockHold.holdId];
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

		const usedSet = new Set<number>();
		Object.values(appliedProductCouponMap).forEach((applied) => {
			if (applied?.unStackable) {
				usedSet.add(applied.unStackable.userCouponId);
			}
			applied?.stackable.forEach((coupon) => usedSet.add(coupon.userCouponId));
		});

		// appliedProductCouponMap과 최대 할인쿠폰을 비교해서 최대 할인쿠폰이 적용됐는지
		let isMaxDiscountApplied = true;
		for (const holdId in maxDiscountAppliedProductCouponMapRef.current) {
			const maxDiscountCoupons = maxDiscountAppliedProductCouponMapRef.current[holdId];
			const appliedCoupons = appliedProductCouponMap[holdId];
			if (!appliedCoupons) {
				isMaxDiscountApplied = false;
				break;
			}
			if (appliedCoupons.unStackable?.couponId !== maxDiscountCoupons.unStackable?.couponId) {
				isMaxDiscountApplied = false;
				break;
			}
			const maxStackableIds = maxDiscountCoupons.stackable
				.map((c) => c.couponId)
				.sort()
				.join(",");
			const appliedStackableIds = appliedCoupons.stackable
				.map((c) => c.couponId)
				.sort()
				.join(",");
			if (maxStackableIds !== appliedStackableIds) {
				isMaxDiscountApplied = false;
				break;
			}
		}

		return {
			buyItemList,
			defaultAddress: stockHoldData.defaultAddress,
			cartCouponList: stockHoldData.availableCartCoupons.map((coupon) => ({ ...coupon, used: usedSet.has(coupon.userCouponId) })),
			sellerCouponList: stockHoldData.availableSellerCoupons.map((coupon) => ({ ...coupon, used: usedSet.has(coupon.userCouponId) })),
			isMaxDiscountApplied,
			buyTotalOriginPrice,
			buyTotalFinalPrice,
			buySelfDiscount,
			cartCouponDiscount,
			sellerCouponDiscount,
			deliveryFee: Object.values(deliveryInfoBySeller).reduce((fee, { totalFinalPrice, baseShippingFee, freeShippingMinAmount }) => {
				return fee + (totalFinalPrice >= freeShippingMinAmount ? 0 : baseShippingFee);
			}, 0),
			holdIds: stockHoldData.stockHoldProductList.map((stockHold) => stockHold.holdId),
		};
	}, [stockHoldData, appliedProductCouponMap]);

	// 디버깅용 log
	useEffect(() => {
		// if (stockHoldData) console.log({ stockHoldData });
		if (cartCouponList.length > 0 || sellerCouponList.length > 0) {
			// console.log({ cartCouponList, sellerCouponList });
		}
		// console.log({ buyTotalOriginPrice, buyTotalFinalPrice, buySelfDiscount, cartCouponDiscount, sellerCouponDiscount });
		// if (appliedProductCouponMap) console.log({ appliedProductCouponMap });
		// if (maxDiscountAppliedProductCouponMapRef.current)
		// 	console.log({ maxDiscountAppliedProductCouponMapRef: maxDiscountAppliedProductCouponMapRef.current });
	}, [
		stockHoldData,
		cartCouponList,
		sellerCouponList,
		buyTotalOriginPrice,
		buyTotalFinalPrice,
		buySelfDiscount,
		cartCouponDiscount,
		sellerCouponDiscount,
		appliedProductCouponMap,
	]);

	// 시작 시, 페이지 떠날 떄
	useEffect(() => {
		return () => {};
	}, []);

	// =================================================================
	// UI
	// =================================================================

	const OrderFormSectionProps = {
		buyItemList,
		cartCouponList,
		sellerCouponList,
		isMaxDiscountApplied,
		appliedProductCouponMap,
		changeAppliedProductCoupon,
		changeMaxDiscountApplied, // 최대 할인 쿠폰 적용하기
		maxDiscountPrice: maxDiscountPrice.current, // 최대 할인 금액
		sumCouponDiscount: cartCouponDiscount + sellerCouponDiscount, // 쿠폰 할인 금액 합
		//
		buyTotalFinalPrice,
	};

	const OrderSummaryPanelProps = {
		buyTotalOriginPrice, // 할인 전 총 상품 가격 (addPrice, count 반영된 가격)
		buyTotalFinalPrice, // 할인 후 총 상품 가격 (addPrice, count, 쿠폰 할인 반영된 가격)
		buySelfDiscount, // 자체 할인가
		cartCouponDiscount, // 장바구니쿠폰 할인가
		sellerCouponDiscount, // 판매자쿠폰 할인가
		deliveryFee, // 배송비
	};

	if (!stockHoldData) return null;
	return (
		<div className={styles.buy}>
			<BuyProvider initialDefaultAddress={defaultAddress} holdIds={holdIds}>
				<div className={styles.page}>
					<h1 className={styles.pageTitle}>주문서</h1>

					<div className={styles.layout}>
						{/* LEFT */}
						<OrderFormSection {...OrderFormSectionProps} />

						{/* RIGHT */}
						<OrderSummaryPanel {...OrderSummaryPanelProps} />
					</div>
				</div>
			</BuyProvider>
		</div>
	);
}
