import { MainProductResponse } from "@/types/main";
import API_URL from "@/api/endpoints";
import { getCached } from "@/api/fetchFilter";
import { getBackendUrl } from "@/lib/getBaseUrl";
import MainClient from "@/app/MainClient";
import { toErrorResponse } from "@/api/error";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function Home() {
	try {
		const productsData = await getCached<MainProductResponse>(getBackendUrl(API_URL.MAIN));

		// console.log({ productList: productsData.productList });
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
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);

		if (status === 404) notFound();

		// error.tsx로 보내기 위한 throw (message는 안전하게)
		const message = typeof payload.message === "string" ? payload.message : "SERVER_ERROR";

		throw new Error(message);
	}
}
