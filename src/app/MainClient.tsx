"use client";

import { ProductSlider } from "@/components/main/ProductSlider";
import { useWishCheck } from "@/hooks/query/product/useWishCheck";
import { MainProduct } from "@/types/main";

export default function MainClient({ productList }: { productList: MainProduct[] }) {
	// 3) [useQuery / useMutation] -----------------------------------------
	const { data: checkedProductIdList = [] } = useWishCheck(productList.map((p) => p.productId));

	return (
		<div className="flex flex-col gap-2">
			<ProductSlider productList={productList.slice(0, 10)} checkedProductIdList={checkedProductIdList} />
			<ProductSlider productList={productList.slice(10, 20)} right checkedProductIdList={checkedProductIdList} />
			<ProductSlider productList={productList.slice(20, 30)} checkedProductIdList={checkedProductIdList} />
		</div>
	);
}
