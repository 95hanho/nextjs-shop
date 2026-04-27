"use client";

import { ProductSlider } from "@/components/main/ProductSlider";
import { MainProduct } from "@/types/main";

export default function MainClient({ productList }: { productList: MainProduct[] }) {
	return (
		<div>
			<ProductSlider productList={productList} />
			<ProductSlider productList={productList} right />
			<ProductSlider productList={productList} />
		</div>
	);
}
