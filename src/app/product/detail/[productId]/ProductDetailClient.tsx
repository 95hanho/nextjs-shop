"use client";

import styles from "./ProductDetail.module.scss";
import ProductReview from "./_components/ProductReview";
import QuestionAnswer from "./_components/QuestionAnswer";
import ProductVisualInfo from "@/app/product/detail/[productId]/_components/ProductVisualInfo";
import ProductEtcInfoSection from "@/app/product/detail/[productId]/_components/ProductEtcInfoSection";
import ProductDescriptionSection from "@/app/product/detail/[productId]/_components/ProductDescriptionSection";
import ProductInfoSection from "@/app/product/detail/[productId]/_components/ProductInfoSection";
import { GetProductDetailResponse, ProductReviewResponse } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { getNormal } from "@/api/fetchFilter";
import API_URL from "@/api/endpoints";
import { getApiUrl } from "@/lib/getBaseUrl";

interface ProductDetailClientProps {
	productDetailResponse: GetProductDetailResponse;
}

export default function ProductDetailClient({ productDetailResponse }: ProductDetailClientProps) {
	console.log(productDetailResponse);

	const productId = productDetailResponse.productDetail.productId;
	const productDetailData = productDetailResponse.productDetail;
	const productReviewSummary = productDetailResponse.productReviewSummary;
	const productUserCoupon = productDetailResponse.availableProductCoupon;
	const productOptionList = productDetailResponse.productOptionList;

	// 리뷰 조회
	const {
		data: reviewResponse,
		isSuccess,
		isError,
		isFetching,
	} = useQuery<ProductReviewResponse>({
		queryKey: ["productReviewList", productId],
		queryFn: () => getNormal(getApiUrl(API_URL.PRODUCT_REVIEW), { productId }),
		enabled: !!productId,
		refetchOnWindowFocus: false,
	});

	const productVisualInfoProps = {
		productDetail: {
			name: productDetailData.name,
			originPrice: productDetailData.originPrice,
			finalPrice: productDetailData.finalPrice,
		},
		reviewCount: productReviewSummary.reviewCount,
		reviewRate: productReviewSummary.avgRating,
		productOptionList,
	};

	console.log({ reviewResponse });
	if (!reviewResponse) return null;
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
				{isFetching && <div>리뷰 불러오는 중...</div>}
				{isError && <div>리뷰를 불러오지 못했어요.</div>}
				{/* {isSuccess && <ProductReview reviewList={reviewResponse.productReviewList} />} */}
				{/* 상품 QnA */}
				<QuestionAnswer />
				{/* 배송정보, 교환, 환불, A/S안내, 같은 카테고리 추천 */}
				<ProductEtcInfoSection />
			</div>
		</main>
	);
}
