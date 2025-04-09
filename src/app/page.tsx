import { mainService } from "@/api";
import { ProductData } from "@/types/main";

import ProductSlider from "@/components/main/ProductSlider";

interface MainData {
	msg: string;
	productList: ProductData[];
}

export default async function Home() {
	const { data }: { data: MainData } = await mainService.getMain();
	const productList = data.productList;

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
