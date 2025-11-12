import { MainProductResponse } from "@/types/main";

import ProductSlider from "@/components/main/ProductSlider";
import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { getBaseUrl } from "@/lib/getBaseUrl";

export default async function Home() {
	console.log(getBaseUrl(API_URL.MAIN));
	const products_data = await getNormal<MainProductResponse>(getBaseUrl(API_URL.MAIN));
	// const products_data = await getNormal<MainProductResponse>("/api" + API_URL.MAIN);
	if (!products_data) {
		return null;
	}
	console.log(products_data);
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
