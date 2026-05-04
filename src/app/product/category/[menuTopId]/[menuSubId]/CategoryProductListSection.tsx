import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductItem } from "@/components/product/ProductItem";
import type { ProductItem as ProductItemType } from "@/types/product";
import { useEffect, useRef } from "react";

interface CategoryProductListSectionProps {
	productList: ProductItemType[];
	fetchNextPage: () => Promise<unknown>;
	hasNextPage?: boolean;
	isFetchingNextPage: boolean;
	checkedProductIdList?: number[];
}

export default function CategoryProductListSection({
	productList,
	fetchNextPage,
	hasNextPage,
	isFetchingNextPage,
	checkedProductIdList,
}: CategoryProductListSectionProps) {
	// 2) [useState / useRef] ----------------------------------------------
	const loadMoreRef = useRef<HTMLDivElement | null>(null);

	// 6) [useEffect] ------------------------------------------------------
	useEffect(() => {
		if (productList.length > 0) {
			// console.log({ productList });
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
								soldOut: productItem.soldOut,
								initWish: checkedProductIdList?.includes(productItem.productId) ?? false,
							}}
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
