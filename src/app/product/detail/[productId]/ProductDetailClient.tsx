"use client";

import styles from "./ProductDetail.module.scss";
import ProductReview from "./_components/ProductReview";
import QuestionAnswer from "./_components/QuestionAnswer";
import ProductVisualInfo from "@/app/product/detail/[productId]/_components/ProductVisualInfo";
import ProductEtcInfoSection from "@/app/product/detail/[productId]/_components/ProductEtcInfoSection";
import ProductDescriptionSection from "@/app/product/detail/[productId]/_components/ProductDescriptionSection";
import ProductInfoSection from "@/app/product/detail/[productId]/_components/ProductInfoSection";
import { GetProductDetailResponse } from "@/types/product";
interface ProductDetailClientProps {
	productDetailResponse: GetProductDetailResponse;
}

export default function ProductDetailClient({ productDetailResponse }: ProductDetailClientProps) {
	console.log(productDetailResponse);

	// SSR 데이터 정리
	const productId = productDetailResponse.productDetail.productId;
	const productDetailData = productDetailResponse.productDetail;
	const productReviewSummary = productDetailResponse.productReviewSummary;
	const productOptionList = productDetailResponse.productOptionList;

	//
	const productVisualInfoProps = {
		productId,
		productDetail: {
			...productDetailData,
			// name: productDetailData.name,
			// originPrice: productDetailData.originPrice,
			// finalPrice: productDetailData.finalPrice,
			// baseShippingFee: productDetailData.baseShippingFee,
			// freeShippingMinAmount: productDetailData.freeShippingMinAmount,
			// extraShippingFee: productDetailData.extraShippingFee,
			// shippingType: productDetailData.shippingType,
			// shippingDueDate: productDetailData.shippingDueDate,
			// shippingNote: productDetailData.shippingNote,
		},
		reviewCount: productReviewSummary.reviewCount,
		reviewRate: productReviewSummary.avgRating,
		productOptionList,
	};

	return (
		<main id="productDetail">
			<div className={styles.productDetail}>
				{/* 상품 사진 및 가격배송 정보 */}
				<ProductVisualInfo {...productVisualInfoProps} />
				{/* 업체등록 상품 상세 블로그 */}
				<ProductDescriptionSection />
				{/* 상품정보 보기, 판매자 정보 */}
				<ProductInfoSection />
				{/* 상품 리뷰 */}
				<ProductReview productId={productId} />
				{/* 상품 QnA */}
				<QuestionAnswer productId={productId} />
				{/* 배송정보, 교환, 환불, A/S안내, 같은 카테고리 추천 */}
				<ProductEtcInfoSection />
			</div>
		</main>
	);
}
