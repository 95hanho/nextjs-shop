"use client";

import CouponList from "@/app/seller/CouponList";
import ProductList from "@/app/seller/ProductList";
import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import {
	GetSellerCouponAllowResponse,
	GetSellerCouponListResponse,
	GetSellerProductListResponse,
	SellerCoupon,
	sellerProduct,
	SetSellerCouponAllowRequest,
	UpdateCouponStatusRequest,
} from "@/types/seller";
import { useQuery } from "@tanstack/react-query";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { useState } from "react";
import styles from "./SellerMain.module.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postJson } from "@/api/fetchFilter";
import { BaseResponse } from "@/types/common";

export default function SellerMainClient() {
	const { loginOn } = useSellerAuth();
	const queryClient = useQueryClient();

	// ------------------------------------------------
	// React Query
	// ------------------------------------------------

	// 판매자 제품 리스트 조회
	const {
		data: sellerProductList = [],
		// isFetching,
	} = useQuery<GetSellerProductListResponse, Error, sellerProduct[]>({
		queryKey: ["sellerProductList"],
		queryFn: () => getNormal(getApiUrl(API_URL.SELLER_PRODUCT)),
		select: (data) => {
			return data.sellerProductList;
		},

		enabled: loginOn,
		refetchOnWindowFocus: false,
	});
	// 판매자 쿠폰 리스트 조회
	const {
		data: sellerCouponList = [],
		// isFetching,
	} = useQuery<GetSellerCouponListResponse, Error, SellerCoupon[]>({
		queryKey: ["sellerCouponList"],
		queryFn: () => getNormal(getApiUrl(API_URL.SELLER_COUPON)),
		select: (data) => {
			return data.couponList;
		},
		enabled: loginOn,
		refetchOnWindowFocus: false,
	});
	// 쿠폰 허용제품 조회용 쿠폰id
	const [allowedSelectedCouponId, setAllowedSelectedCouponId] = useState<number | null>(null);
	// 판매자 쿠폰 허용 제품 조회(allowedSelectedCouponId가 null이 아닐 때만 활성화)
	const { data: couponAllowedProductIds = [], isLoading: isCouponAllowedProductIdsLoading } = useQuery<
		GetSellerCouponAllowResponse | null,
		Error,
		number[]
	>({
		queryKey: ["couponAllowedProductIds", allowedSelectedCouponId],
		queryFn: async () => {
			if (allowedSelectedCouponId === null) return null;
			return await getNormal(getApiUrl(API_URL.SELLER_COUPON_ALLOWED), { couponId: allowedSelectedCouponId });
		},
		select: (data) => {
			return data?.couponAllowedProductIds || [];
		},
		enabled: loginOn && allowedSelectedCouponId !== null,
		refetchOnWindowFocus: false,
	});
	// 쿠폰 허용제품 변경
	const { mutate: updateCouponAllowedProducts } = useMutation({
		mutationKey: ["updateCouponAllowedProducts"],
		mutationFn: async (productIds: number[]) => {
			if (allowedSelectedCouponId === null) throw new Error("선택된 쿠폰이 없습니다.");
			// 기존 허용 제품에 없는 ID만 addProductIds에 포함
			const addProductIds = productIds.filter((id) => !couponAllowedProductIds.includes(id));
			// 기존 허용 제품 중에서 선택된 ID 중 addProductIds에 포함되지 않은 ID는 removeProductIds에 포함
			const removeProductIds = productIds.filter((id) => !addProductIds.includes(id));

			console.log("request", {
				allowedSelectedCouponId,
				addProductIds,
				removeProductIds,
			});

			return postJson<BaseResponse, SetSellerCouponAllowRequest>(getApiUrl(API_URL.SELLER_COUPON_ALLOWED), {
				couponId: allowedSelectedCouponId,
				addProductIds,
				removeProductIds, // 실제로는 기존 허용 제품과 비교해서 제거할 제품 ID 리스트 생성 필요
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["couponAllowedProductIds", allowedSelectedCouponId] });
			setSelectedProductIds([]); // 변경 후 선택 초기화
		},
		onError: (error) => {
			console.log("쿠폰 허용제품 변경 실패:", error.message);
		},
	});
	// 쿠폰 상태 변경
	const { mutate: updateCouponStatus } = useMutation({
		mutationKey: ["updateCouponStatus"],
		mutationFn: async ({ activeCouponIds = [], suspendedCouponIds = [] }: UpdateCouponStatusRequest) => {
			return postJson<BaseResponse, UpdateCouponStatusRequest>(getApiUrl(API_URL.SELLER_COUPON_STATUS), {
				activeCouponIds,
				suspendedCouponIds, // 실제로는 기존 허용 제품과 비교해서 제거할 제품 ID 리스트 생성 필요
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sellerCouponList"] });
		},
		onError: (error) => {
			console.log("쿠폰 상태 변경 실패:", error.message);
		},
	});

	// ------------------------------------------------
	// React
	// ------------------------------------------------

	// 선택된 쿠폰 목록
	const [selectedCouponIds, setSelectedCouponIds] = useState<number[]>([]);
	// 선택된 상품 목록
	const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

	// ------------------------------------------------
	// UI
	// ------------------------------------------------
	const couponListProps = {
		sellerCouponList,
		allowedSelectedCouponId,
		changeAllowedSelectedCouponId: (id: number | null) => {
			setAllowedSelectedCouponId(id);
			setSelectedCouponIds([]);
		},
		selectedCouponIds,
		changeSelectedCouponIds: (id: number) => {
			const isChecked = selectedCouponIds.includes(id);
			if (!isChecked) {
				setSelectedCouponIds([...selectedCouponIds, id]);
			} else {
				setSelectedCouponIds(selectedCouponIds.filter((couponId) => couponId !== id));
			}
		},
		changeAllSelectedCouponIds: (isChecked: boolean) => {
			if (isChecked) {
				setSelectedCouponIds(sellerCouponList.map((coupon) => coupon.couponId));
			} else {
				setSelectedCouponIds([]);
			}
		},
		updateCouponStatus,
	};
	const productListProps = {
		sellerProductList,
		allowedSelectedCouponId,
		couponAllowedProductIds,
		updateCouponAllowedProducts,
		isCouponAllowedProductIdsLoading,
		selectedProductIds,
		changeSelectedProductIds: (id: number) => {
			const isChecked = selectedProductIds.includes(id);
			if (!isChecked) {
				setSelectedProductIds([...selectedProductIds, id]);
			} else {
				setSelectedProductIds(selectedProductIds.filter((productId) => productId !== id));
			}
		},
		changeAllSelectedProductIds: (isChecked: boolean) => {
			if (isChecked) {
				setSelectedProductIds(sellerProductList.map((product) => product.productId));
			} else {
				setSelectedProductIds([]);
			}
		},
	};

	if (sellerProductList.length === 0 || sellerCouponList.length === 0) return null;
	return (
		<div className={styles.sellerMainContainer}>
			<h1>Seller Page - {allowedSelectedCouponId ? "쿠폰상품제한모드" : "일반모드"}</h1>
			<div className="text-sm text-right">
				<p>* 더블클릭 시 상세보기/수정</p>
			</div>
			<CouponList {...couponListProps} />
			<ProductList {...productListProps} />
			{/* <QuestionAnswer  /> */}
			{/* <ReviewList  /> */}
			{/* <CouponUsedList  /> */}
			{/* <SalesList  /> */}
		</div>
	);
}
