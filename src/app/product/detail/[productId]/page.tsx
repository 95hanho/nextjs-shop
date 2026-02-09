import ProductDetailClient from "@/app/product/detail/[productId]/ProductDetailClient";

export default function ProductDetail({
	params: { productId },
}: {
	params: {
		productId: string;
	};
}) {
	return <ProductDetailClient productId={productId} />;
}
