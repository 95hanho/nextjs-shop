"use client";

import { ProductSlider } from "@/components/main/ProductSlider";
import { MainProduct } from "@/types/main";

export default function MainClient({ productList }: { productList: MainProduct[] }) {
	return (
		<div>
			<ProductSlider productList={productList.slice(0, 10)} />
			<ProductSlider productList={productList.slice(10, 20)} right />
			<ProductSlider productList={productList.slice(20, 30)} />
		</div>
	);
}
