import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductItem } from "@/components/product/ProductItem";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import type { ProductItem as ProductItemType } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

interface CategoryProductListSectionProps {
	productList: ProductItemType[];
	fetchNextPage: () => Promise<unknown>;
	hasNextPage?: boolean;
	isFetchingNextPage: boolean;
}

export default function CategoryProductListSection({ productList, fetchNextPage, hasNextPage, isFetchingNextPage }: CategoryProductListSectionProps) {
	// 1) [store / custom hooks] -------------------------------------------
	const { loginOn } = useAuth();
	// 2) [useState / useRef] ----------------------------------------------
	const loadMoreRef = useRef<HTMLDivElement | null>(null);

	// 3) [useQuery / useMutation] -----------------------------------------
	const { data: wishProductIds = [] } = useQuery<BaseResponse & { wishProductIds: number[] }, Error, number[]>({
		queryKey: ["wishProductIds"],
		queryFn: () => getNormal(getApiUrl(API_URL.PRODUCT_WISH)),
		enabled: loginOn,
		refetchOnWindowFocus: false,
		retry: false,
		select: (data) => data.wishProductIds,
	});

	// 6) [useEffect] ------------------------------------------------------
	useEffect(() => {
		if (wishProductIds.length > 0) {
			console.log("wishProductIds", wishProductIds);
		}
	}, [wishProductIds]);
	useEffect(() => {
		if (productList.length > 0) {
			console.log({ productList });
		}
	}, [productList]);
	// 무한 스크롤 - 인터섹션 옵저버
	useEffect(() => {
		const target = loadMoreRef.current;
		if (!target) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (!entry.isIntersecting || !hasNextPage || isFetchingNextPage) return;

				fetchNextPage();
			},
			{
				root: null,
				rootMargin: "0px 0px 300px 0px",
				threshold: 0,
			},
		);

		observer.observe(target);

		return () => observer.disconnect();
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	return (
		<section id="categoryProductListSection">
			<ProductGrid>
				{/* 각 상품들 */}
				{productList.map((productItem) => {
					return (
						<ProductItem
							key={"category_product-" + productItem.productId}
							product={{
								id: productItem.productId,
								productId: productItem.productId,
								productImageList: productItem.productImageList,
								sellerName: productItem.sellerName,
								productName: productItem.name,
								originPrice: productItem.originPrice,
								finalPrice: productItem.finalPrice,
								viewCount: productItem.viewCount,
								wishCount: productItem.wishCount,
							}}
							wishProductIds={wishProductIds}
						/>
					);
				})}
			</ProductGrid>
			<div ref={loadMoreRef} style={{ height: 1 }} />
			{isFetchingNextPage && <div>상품을 더 불러오는 중...</div>}
			{!hasNextPage && productList.length > 0 && <div>마지막 상품입니다.</div>}
		</section>
	);
}
