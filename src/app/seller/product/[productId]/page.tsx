import ProductSetClient from "@/app/seller/product/[productId]/ProductSetClient";

// 상품 설정 페이지
export default function ProductSetPage({
	params: { productId },
}: {
	params: {
		productId: number;
	};
}) {
	return <ProductSetClient productId={productId} />;
}
