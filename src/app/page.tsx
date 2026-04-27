import { MainProductResponse } from "@/types/main";

import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import MainClient from "@/app/MainClient";

export default async function Home() {
	const productsData = await getNormal<MainProductResponse>(getApiUrl(API_URL.MAIN));

	console.log({ productList: productsData.productList });

	// return <h1>테스트중</h1>;

	if (!productsData) {
		return null;
	}
	const productList = productsData.productList;

	return (
		<main id="main">
			<MainClient productList={productList} />
		</main>
	);
}
