import ProductAddClient from "@/app/seller/product/ProductAddClient";

// 상품 추가 페이지
export default function ProductAddPage({
	params: { productId },
}: {
	params: {
		productId: number;
	};
}) {
	return <ProductAddClient productId={productId} />;
}
