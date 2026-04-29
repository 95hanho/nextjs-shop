"use client";

import styles from "./ProductDetail.module.scss";
import QuestionAnswer from "./_components/QuestionAnswer";
import ProductVisualInfo from "@/app/product/detail/[productId]/_components/ProductVisualInfo";
import ProductEtcInfoSection from "@/app/product/detail/[productId]/_components/ProductEtcInfoSection";
import ProductDescriptionSection from "@/app/product/detail/[productId]/_components/ProductDescriptionSection";
import ProductInfoSection from "@/app/product/detail/[productId]/_components/ProductInfoSection";
import { GetProductDetailResponse } from "@/types/product";
import { useEffect, useMemo, useRef } from "react";
import ProductReview from "@/app/product/detail/[productId]/_components/ProductReview";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { removeSearchParams } from "@/lib/searchParams";
import { useQuery } from "@tanstack/react-query";
import { getNormal } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
interface ProductDetailClientProps {
	initProductDetailResponse: GetProductDetailResponse;
}

export default function ProductDetailClient({ initProductDetailResponse }: ProductDetailClientProps) {
	// 1) [store / custom hooks] -------------------------------------------
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const tab = searchParams.get("tab");
	const params = useParams<{
		productId: string;
	}>();
	const productId = Number(params.productId);

	// 2) [useState / useRef] ----------------------------------------------
	// 리뷰섹션 요소
	const reviewInfoSectionRef = useRef<HTMLDivElement | null>(null);

	// 3) [useQuery / useMutation] -----------------------------------------
	// 상품 상세 정보 (SSR로 받아온 데이터 활용, 필요 시 최신 데이터로 갱신)
	const { data: productDetailResponse } = useQuery<GetProductDetailResponse>({
		queryKey: ["productDetail", productId],
		queryFn: () => getNormal(getApiUrl(API_URL.PRODUCT_DETAIL), { productId }),
		initialData: initProductDetailResponse,
		staleTime: Infinity,
	});

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
	}, [productDetailResponse, productReviewSummary, productOptionList]);

	// 5) [handlers / useCallback] -----------------------------------------
	const handleMoveToReviewSection = () => {
		reviewInfoSectionRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	// 6) [useEffect] ------------------------------------------------------
	// 쿼리 tab이 리뷰인 경우 리뷰 섹션으로 이동
	useEffect(() => {
		if (tab === "review") {
			handleMoveToReviewSection();
			router.replace(removeSearchParams(pathname, searchParams, ["tab"]), { scroll: false });
		}
	}, [pathname, searchParams, tab, router]);

	// 7) [UI helper values] -------------------------------------------------
	const productVisualInfoProps = {
		productDetail,
		reviewCount,
		reviewRate,
		initProductOptionList,
		handleMoveToReviewSection,
	};
	const ProductReviewProps = {
		reviewCount,
		reviewRate,
	};

	return (
		<div className={styles.productDetail}>
			{/* 상품 사진 및 가격배송 정보 */}
			<ProductVisualInfo {...productVisualInfoProps} />
			{/* 업체등록 상품 상세 블로그 */}
			<ProductDescriptionSection />
			{/* 상품정보 보기, 판매자 정보 */}
			<ProductInfoSection productDetail={productDetail} />
			{/* 상품 리뷰 */}
			<ProductReview {...ProductReviewProps} ref={reviewInfoSectionRef} />
			{/* 상품 QnA */}
			<QuestionAnswer sellerName={productDetail.sellerName} />
			{/* 배송정보, 교환, 환불, A/S안내, 같은 카테고리 추천 */}
			<ProductEtcInfoSection />
		</div>
	);
}
