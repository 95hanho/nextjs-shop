"use client";

import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { ProductSetForm } from "@/components/seller/product/ProductSetForm";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import { GetSellerProductDetailResponse, SellerProductDetail } from "@/types/seller";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProductSetClientProps {
	productId: number;
}

export default function ProductUpdateClient({ productId }: ProductSetClientProps) {
	const router = useRouter();
	const { openDialog } = useGlobalDialogStore();

	// ------------------------------------------------
	// React Query
	// ------------------------------------------------

	// 판매자 제품 상세보기 조회
	const {
		data: productDetail,
		error,
		isFetching,
	} = useQuery<GetSellerProductDetailResponse, Error, SellerProductDetail>({
		queryKey: ["sellerProductDetail", Number(productId)],
		queryFn: () =>
			getNormal(getApiUrl(API_URL.SELLER_PRODUCT_DETAIL), {
				productId: Number(productId),
			}),
		enabled: !!Number(productId),
		select: (data) => data.productDetail,
		refetchOnWindowFocus: false,
		retry: 1,
	});

	// ------------------------------------------------
	// React
	// ------------------------------------------------

	// ------------------------------------------------
	// useEffect
	// ------------------------------------------------

	// 제품수정 폼 초기화
	useEffect(() => {
		if (error) {
			if (error.message === "NO_PERMISSION_OR_PRODUCT_NOT_FOUND") {
				openDialog("ALERT", {
					content: "제품을 찾을 수 없거나 권한이 없습니다.",
					handleAfterClose() {
						router.replace("/seller");
					},
				});
			}
			// NO_PERMISSION_OR_PRODUCT_NOT_FOUND
		}
	}, [error, openDialog, router]);

	useEffect(() => {
		if (isFetching) {
			console.log("제품 상세정보 조회 중...");
		}
	}, [isFetching]);

	if (!productDetail) return null;
	return <ProductSetForm productId={Number(productId)} prevProductSetData={productDetail} />;
}
