import { ReviewStar } from "@/components/product/ReviewStar";
import { money } from "@/lib/format";
import styles from "../ProductDetail.module.scss";
import { useQuery } from "@tanstack/react-query";
import { GetProductDetailReviewResponse, ProductReviewItem } from "@/types/product";
import { getNormal } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { SmartImage } from "@/components/ui/SmartImage";
import { getUploadImageUrl } from "@/lib/image";
import ProductReviewList from "@/app/product/detail/[productId]/_components/ProductReviewList";
import { removeSearchParams } from "@/lib/searchParams";

interface ProductReviewProps {
	reviewCount: number;
	reviewRate: number;
}

// 상품 리뷰
export default function ProductReview({ reviewCount, reviewRate }: ProductReviewProps) {
	const params = useParams<{
		productId: string;
	}>();
	const productIdNum = Number(params.productId);
	const searchParams = useSearchParams();
	const tab = searchParams.get("tab");
	const router = useRouter();
	const pathname = usePathname();

	// =================================================================
	// React Query
	// =================================================================

	// 리뷰 조회
	const {
		data: productReviewList = [],
		isSuccess,
		isError,
		isFetching,
	} = useQuery<GetProductDetailReviewResponse, Error, ProductReviewItem[]>({
		queryKey: ["productReviewList", productIdNum],
		queryFn: () => getNormal(getApiUrl(API_URL.PRODUCT_DETAIL_REVIEW), { productId: productIdNum }),
		enabled: !!productIdNum,
		refetchOnWindowFocus: false,
		select(data) {
			return data.productReviewList;
		},
	});

	// =================================================================
	// React
	// =================================================================

	// 리뷰섹션 요소
	const reviewInfoSectionRef = useRef<HTMLElement | null>(null);

	// =================================================================
	// useEffect
	// =================================================================

	useEffect(() => {
		if (productReviewList?.length > 0) {
			if (tab === "review") {
				reviewInfoSectionRef.current?.scrollIntoView({ behavior: "smooth" });
				router.replace(removeSearchParams(pathname, searchParams, ["tab"]), { scroll: false });
			}
		}
	}, [productReviewList, tab, searchParams, router, pathname]);
	const { allReviewImages } = useMemo(() => {
		return {
			allReviewImages: productReviewList.flatMap((review) => review.reviewImages.map((image) => ({ ...image, reviewId: review.reviewId }))),
		};
	}, [productReviewList]);

	return (
		<>
			{isFetching && <div>리뷰 불러오는 중...</div>}
			{isError && <div>리뷰를 불러오지 못했어요.</div>}
			{isSuccess && (
				<section id="reviewInfoSection" className={styles.reviewInfoSection} ref={reviewInfoSectionRef}>
					<h2 className="flex">
						<span>리뷰({money(reviewCount)}개)</span>
						<span className="ml-2">
							<ReviewStar rate={reviewRate} />
						</span>
					</h2>
					<div className="px-2">
						{/* 사진 모음 */}
						<div className={styles.allReviewImages}>
							{allReviewImages.map((image) => (
								<button key={`allReviewImage-${image.fileId}`}>
									<SmartImage src={getUploadImageUrl(image.storeName)} alt={image.fileName} width={120} height={120} />
								</button>
							))}
						</div>
						<ProductReviewList productReviewList={productReviewList} />
					</div>
				</section>
			)}
		</>
	);
}
