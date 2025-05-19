import { mainService } from "@/api";
import { ProductData } from "@/types/main";

import ProductSlider from "@/components/main/ProductSlider";

interface MainSlideData {
	msg: string;
	productList: ProductData[];
}

export default async function Home() {
	const { data: products_data }: { data: MainSlideData } = await mainService.getMainSlideProducts();
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
