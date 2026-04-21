import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, RequestHeaders } from "@/api/fetchFilter";
import ProductDetailClient from "@/app/product/detail/[productId]/ProductDetailClient";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { GetProductDetailResponse } from "@/types/product";
import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";

export default async function ProductDetail({
	params: { productId },
}: {
	params: {
		productId: string;
	};
}) {
	try {
		const accessToken = cookies().get("accessToken")?.value || headers().get("accessToken") || undefined;

		const headerParams: RequestHeaders = {};
		if (accessToken) headerParams.Authorization = `Bearer ${accessToken}`;

		const productDetailResponse = await getNormal<GetProductDetailResponse>(
			getBackendUrl(API_URL.PRODUCT_DETAIL),
			{
				productId: Number(productId),
			},
			headerParams,
		);

		return <ProductDetailClient productDetailResponse={productDetailResponse} />;
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);

		if (status === 404) notFound();

		// error.tsx로 보내기 위한 throw (message는 안전하게)
		const message = typeof payload.message === "string" ? payload.message : "SERVER_ERROR";

		throw new Error(message);
	}
}
