"use client";

import styles from "./ProductDetail.module.scss";
import ProductReview from "./_components/ProductReview";
import QuestionAnswer from "./_components/QuestionAnswer";
import ProductVisualInfo from "@/app/product/detail/[productId]/_components/ProductVisualInfo";
import ProductEtcInfoSection from "@/app/product/detail/[productId]/_components/ProductEtcInfoSection";
import ProductDescriptionSection from "@/app/product/detail/[productId]/_components/ProductDescriptionSection";
import ProductInfoSection from "@/app/product/detail/[productId]/_components/ProductInfoSection";
import { GetProductDetailResponse } from "@/types/product";
import { useMemo } from "react";
interface ProductDetailClientProps {
	productDetailResponse: GetProductDetailResponse;
}

export default function ProductDetailClient({ productDetailResponse }: ProductDetailClientProps) {
	// 4) [derived values / useMemo] ---------------------------------------
	// SSR 데이터 정리
	const productReviewSummary = productDetailResponse.productReviewSummary;
	const productOptionList = productDetailResponse.productOptionList;
	const { productDetail, reviewCount, reviewRate, initProductOptionList } = useMemo(() => {
		return {
			productDetail: productDetailResponse.productDetail,
			reviewCount: productReviewSummary.reviewCount,
			reviewRate: productReviewSummary.avgRating,
			initProductOptionList: productOptionList,
		};
	}, [productDetailResponse.productDetail, productReviewSummary.reviewCount, productReviewSummary.avgRating, productOptionList]);

	// 7) [UI helper values] -------------------------------------------------
	const productVisualInfoProps = {
		productDetail,
		reviewCount,
		reviewRate,
		initProductOptionList,
	};
	const ProductReviewProps = {
		reviewCount,
		reviewRate,
	};

	return (
		<main id="productDetail">
			<div className={styles.productDetail}>
				{/* 상품 사진 및 가격배송 정보 */}
				<ProductVisualInfo {...productVisualInfoProps} />
				{/* 업체등록 상품 상세 블로그 */}
				<ProductDescriptionSection />
				{/* 상품정보 보기, 판매자 정보 */}
				<ProductInfoSection productDetail={productDetailResponse.productDetail} />
				{/* 상품 리뷰 */}
				<ProductReview {...ProductReviewProps} />
				{/* 상품 QnA */}
				<QuestionAnswer sellerName={productDetailResponse.productDetail.sellerName} />
				{/* 배송정보, 교환, 환불, A/S안내, 같은 카테고리 추천 */}
				<ProductEtcInfoSection />
			</div>
		</main>
	);
}
