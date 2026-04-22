import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductItem } from "@/components/product/ProductItem";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import type { ProductItem as ProductItemType } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface CategoryProductListSectionProps {
	productList: ProductItemType[];
}

export default function CategoryProductListSection({ productList }: CategoryProductListSectionProps) {
	// 1) [store / custom hooks] -------------------------------------------
	const { loginOn } = useAuth();

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
		if (wishProductIds) {
			console.log("wishProductIds", wishProductIds);
		}
	}, [wishProductIds]);
	useEffect(() => {
		console.log({ productList });
	}, [productList]);

	return (
		<section id="categoryProductListSection">
			<ProductGrid>
				{/* 각 상품들 */}
				{productList.slice(0, 30).map((productItem) => {
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
		</section>
	);
}
