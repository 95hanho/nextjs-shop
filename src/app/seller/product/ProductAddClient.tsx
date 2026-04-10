"use client";

import { ProductSetForm } from "@/components/seller/product/ProductSetForm";

interface ProductAddClientProps {
	productId: number;
}

export default function ProductAddClient({ productId }: ProductAddClientProps) {
	return <ProductSetForm productId={productId} />;
}
