import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getCached } from "@/api/fetchFilter";
import ProductDetailClient from "@/app/product/detail/[productId]/ProductDetailClient";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetProductDetailResponse } from "@/types/product";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
	return [];
}

export default async function ProductDetail({
	params: { productId },
}: {
	params: {
		productId: string;
	};
}) {
	try {
		const productDetailResponse = await getCached<GetProductDetailResponse>(getBackendUrl(API_URL.PRODUCT_DETAIL), {
			productId: Number(productId),
		});

		return (
			<main id="productDetail">
				<Suspense fallback={null}>
					<ProductDetailClient initProductDetailResponse={productDetailResponse} />
				</Suspense>
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
