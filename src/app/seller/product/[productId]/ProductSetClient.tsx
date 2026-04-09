"use client";

import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { FormPageShell } from "@/components/form/FormPageShell";
import { getApiUrl } from "@/lib/getBaseUrl";
import { GetSellerProductDetailResponse, SellerProductDetail } from "@/types/seller";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface ProductSetClientProps {
	productId: number;
}

export default function ProductSetClient({ productId }: ProductSetClientProps) {
	// ------------------------------------------------
	// React Query
	// ------------------------------------------------

	// 판매자 제품 상세보기 조회
	const { data: productDetail } = useQuery<GetSellerProductDetailResponse, Error, SellerProductDetail>({
		queryKey: ["sellerProductDetail", productId],
		queryFn: () =>
			getNormal(getApiUrl(API_URL.SELLER_PRODUCT_DETAIL), {
				productId,
			}),
		enabled: !!productId,
		select: (data) => data.productDetail,
		refetchOnWindowFocus: false,
	});

	// ------------------------------------------------
	// useEffect
	// ------------------------------------------------

	useEffect(() => {
		console.log("productDetail", productDetail);
	}, [productDetail]);

	if (!productDetail) return null;
	return (
		<FormPageShell title={"제품 수정"} formWidth={500} wrapMinHeight={100}>
			<div></div>
		</FormPageShell>
	);
}
