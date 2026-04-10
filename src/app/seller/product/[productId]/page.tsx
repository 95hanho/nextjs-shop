import ProductUpdateClient from "@/app/seller/product/[productId]/ProductUpdateClient";

// 상품 수정 페이지
export default function ProductUpdatePage({
	params: { productId },
}: {
	params: {
		productId: number;
	};
}) {
	return <ProductUpdateClient productId={productId} />;
}
