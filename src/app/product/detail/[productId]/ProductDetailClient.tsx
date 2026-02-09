"use client";

import styles from "./ProductDetail.module.scss";
import ProductReview from "./_components/ProductReview";
import QuestionAnswer from "./_components/QuestionAnswer";
import ProductVisualInfo from "@/app/product/detail/[productId]/_components/ProductVisualInfo";
import ProductEtcInfoSection from "@/app/product/detail/[productId]/_components/ProductEtcInfoSection";
import ProductDescriptionSection from "@/app/product/detail/[productId]/_components/ProductDescriptionSection";
import ProductInfoSection from "@/app/product/detail/[productId]/_components/ProductInfoSection";

interface ProductDetailClientProps {
	productId: string;
}

export default function ProductDetailClient({ productId }: ProductDetailClientProps) {
	console.log(productId);
	return (
		<main id="productDetail">
			<div className={styles.productDetail}>
				{/* 상품 사진 및 가격배송 정보 */}
				<ProductVisualInfo />
				{/* 업체등록 상품 상세 블로그 */}
				<ProductDescriptionSection />
				{/* 상품정보 보기, 판매자 정보 */}
				<ProductInfoSection />
				{/* 상품 리뷰 */}
				<ProductReview />
				{/* 상품 QnA */}
				<QuestionAnswer />
				{/* 배송정보, 교환, 환불, A/S안내, 같은 카테고리 추천 */}
				<ProductEtcInfoSection />
			</div>
		</main>
	);
}
