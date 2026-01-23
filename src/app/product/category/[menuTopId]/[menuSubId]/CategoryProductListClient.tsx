"use client";

import ProductGrid from "@/components/product/ProductGrid";
import ProductItem from "@/components/product/ProductItem";
import type { ProductItem as ProductItemType } from "@/types/product";

interface CategoryProductListClientProps {
	productList: ProductItemType[];
}

export default function CategoryProductListClient({ productList }: CategoryProductListClientProps) {
	return (
		<main id="categoryProductListClient">
			<header></header>
			<section>
				<ProductGrid>
					{/* 각 상품들 */}
					{productList.map((productItem) => {
						return (
							<ProductItem
								key={"category_product-" + productItem.productId}
								product={{
									id: productItem.productId,
									productId: productItem.productId,
									filePath: productItem.productImageList[0]?.filePath || "",
									sellerName: productItem.sellerName,
									productName: productItem.name,
									originPrice: productItem.originPrice,
									finalPrice: productItem.finalPrice,
									likeCount: productItem.likeCount,
									wishCount: productItem.wishCount,
								}}
							/>
						);
					})}
				</ProductGrid>
			</section>
		</main>
	);
}
