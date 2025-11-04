import { MainProductResponse } from "@/types/main";

import ProductSlider from "@/components/main/ProductSlider";
import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";

export default async function Home() {
	const res = await getNormal(API_URL.MAIN);
	if (!res.ok) {
		return null;
	}
	const products_data: MainProductResponse = await res.json();
	const productList = products_data.productList;

	return (
		<main id="main">
			<div className="product-wrap">
				<ProductSlider productList={productList} />
				<ProductSlider productList={productList} right={true} />
				<ProductSlider productList={productList} />
			</div>
		</main>
	);
}
