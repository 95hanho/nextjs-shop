import { MainProductResponse } from "@/types/main";

import API_URL from "@/api/endpoints";
import { getNormal, RequestHeaders } from "@/api/fetchFilter";
import { getBackendUrl } from "@/lib/getBaseUrl";
import MainClient from "@/app/MainClient";
import { cookies, headers } from "next/headers";
import { toErrorResponse } from "@/api/error";
import { notFound } from "next/navigation";

export default async function Home() {
	try {
		const accessToken = cookies().get("accessToken")?.value || headers().get("accessToken") || undefined;
		const headerParams: RequestHeaders = {};
		if (accessToken) headerParams.Authorization = `Bearer ${accessToken}`;

		const productsData = await getNormal<MainProductResponse>(getBackendUrl(API_URL.MAIN), undefined, headerParams);

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
