import { ReviewStar } from "@/components/product/ReviewStar";
import { money } from "@/lib/format";
import styles from "../ProductDetail.module.scss";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GetProductDetailReviewResponse, ProductReviewItem } from "@/types/product";
import { getNormal } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SmartImage } from "@/components/ui/SmartImage";
import { getUploadImageUrl } from "@/lib/image";
import ProductReviewList from "@/app/product/detail/[productId]/_components/ProductReviewList";
import { removeSearchParams } from "@/lib/searchParams";
import { useModalStore } from "@/store/modal.store";
import { ReviewImage } from "@/types/mypage";
import clsx from "clsx";

export type PrepareReviewModalListParams = {
	clickedReviewImageId: number;
	baseReviewList?: ProductReviewItem[];
	startPage?: number;
};
export type PrepareReviewModalListReturn = {
	reviewList: ProductReviewItem[];
	prevPage: number;
	nextPage: number;
};
interface ProductReviewProps {
	reviewCount: number;
	reviewRate: number;
}
// 상품 리뷰
export default function ProductReview({ reviewCount, reviewRate }: ProductReviewProps) {
	// 1) [store / custom hooks] -------------------------------------------
	const params = useParams<{
		productId: string;
	}>();
	const productIdNum = Number(params.productId);
	const searchParams = useSearchParams();
	const tab = searchParams.get("tab");
	const router = useRouter();
	const pathname = usePathname();
	const { openModal } = useModalStore();
	const queryClient = useQueryClient();

	// 2) [useState / useRef] ----------------------------------------------
	// 리뷰섹션 요소
	const reviewInfoSectionRef = useRef<HTMLElement | null>(null);
	// 리뷰 페이지
	const [reviewPage, setReviewPage] = useState(1);
	// 리뷰 초기 상단 이미지 리스트
	const [initReviewImageList, setInitReviewImageList] = useState<ReviewImage[]>([]);

	// 3) [useQuery / useMutation] -----------------------------------------
	// 리뷰 조회
	const {
		data: productReviewData = {
			message: "",
			page: 1,
			// size: 10,
			// totalCount: 0,
			totalPage: 1,
			productReviewList: [],
			initReviewImageList: [],
		},
		isSuccess,
		isError,
		isFetching,
	} = useQuery<GetProductDetailReviewResponse, Error>({
		queryKey: ["productReviewList", productIdNum, reviewPage],
		queryFn: () => getNormal(getApiUrl(API_URL.PRODUCT_DETAIL_REVIEW), { productId: productIdNum, page: reviewPage }),
		enabled: !!productIdNum,
		refetchOnWindowFocus: false,
	});

	// 4) [derived values / useMemo] ---------------------------------------
	const MIN_TOTAL = 7;
	const MIN_BEFORE = 3;
	const MIN_AFTER = 3;

	// 5) [handlers / useCallback] -----------------------------------------
	const getImageReviewList = (reviewList: ProductReviewItem[]) => {
		return reviewList.filter((review) => review.reviewImages?.length > 0);
	};
	const flatten = (list: ProductReviewItem[]) =>
		list.flatMap((review) =>
			review.reviewImages.map((img) => ({
				...img,
				reviewId: review.reviewId,
			})),
		);

	const prepareReviewModalList = async ({
		clickedReviewImageId,
		baseReviewList = getImageReviewList(productReviewData.productReviewList),
		startPage = reviewPage,
	}: PrepareReviewModalListParams): Promise<PrepareReviewModalListReturn> => {
		let prevPage = startPage;
		let nextPage = startPage;

		let modalReviewList = baseReviewList;
		let flatImageList = flatten(modalReviewList);

		const getClickedInfo = () => {
			const clickedIndex = flatImageList.findIndex((image) => image.reviewImageId === clickedReviewImageId);

			return {
				clickedIndex,
				beforeCount: clickedIndex,
				afterCount: flatImageList.length - clickedIndex - 1,
			};
		};

		// 앞쪽 보충
		while (prevPage > 1) {
			const { clickedIndex, beforeCount } = getClickedInfo();

			if (clickedIndex < 0 || (flatImageList.length >= MIN_TOTAL && beforeCount >= MIN_BEFORE)) {
				break;
			}

			prevPage--;

			const prevData = await queryClient.fetchQuery<GetProductDetailReviewResponse>({
				queryKey: ["productReviewList", productIdNum, prevPage],
				queryFn: () =>
					getNormal(getApiUrl(API_URL.PRODUCT_DETAIL_REVIEW), {
						productId: productIdNum,
						page: prevPage,
					}),
			});

			const prevImageReviews = getImageReviewList(prevData.productReviewList);

			if (prevImageReviews.length === 0) continue;

			modalReviewList = [...prevImageReviews, ...modalReviewList];
			flatImageList = flatten(modalReviewList);
		}

		// 뒤쪽 보충
		while (nextPage < productReviewData.totalPage) {
			const { clickedIndex, afterCount } = getClickedInfo();

			if (clickedIndex < 0 || (flatImageList.length >= MIN_TOTAL && afterCount >= MIN_AFTER)) {
				break;
			}

			nextPage++;

			const nextData = await queryClient.fetchQuery<GetProductDetailReviewResponse>({
				queryKey: ["productReviewList", productIdNum, nextPage],
				queryFn: () =>
					getNormal(getApiUrl(API_URL.PRODUCT_DETAIL_REVIEW), {
						productId: productIdNum,
						page: nextPage,
					}),
			});

			const nextImageReviews = getImageReviewList(nextData.productReviewList);

			if (nextImageReviews.length === 0) continue;

			modalReviewList = [...modalReviewList, ...nextImageReviews];
			flatImageList = flatten(modalReviewList);
		}

		return {
			reviewList: modalReviewList,
			prevPage,
			nextPage,
		};
	};
	const handleOpenProductReviewModal = async (clickedReviewImageId: number) => {
		const prepared = await prepareReviewModalList({
			clickedReviewImageId,
		});

		openModal("PRODUCT_REVIEW", {
			reviewImageId: clickedReviewImageId,
			disableOverlayClose: true,
			initReviewList: prepared.reviewList,
			initPrevPage: prepared.prevPage,
			initNextPage: prepared.nextPage,
			fetchMoreReviewImages: prepareReviewModalList,
		});
	};

	// 6) [useEffect] ------------------------------------------------------
	useEffect(() => {
		if (productReviewData.initReviewImageList && productReviewData.initReviewImageList.length > 0) {
			setInitReviewImageList(productReviewData.initReviewImageList);
		}
	}, [productReviewData.initReviewImageList]);
	useEffect(() => {
		if (productReviewData.productReviewList.length > 0) {
			// productReviewData.productReviewList.map((review) => {
			// 	review.reviewImages.map((image) => {
			// 		console.log(image.filePath);
			// 	});
			// });
			if (tab === "review") {
				reviewInfoSectionRef.current?.scrollIntoView({ behavior: "smooth" });
				router.replace(removeSearchParams(pathname, searchParams, ["tab"]), { scroll: false });
			}
		}
	}, [productReviewData, tab, searchParams, router, pathname]);
	// 리뷰 모달 테스트중 ------------

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
						<span className="inline-flex items-center mt-2 ml-2 text-xs">{reviewRate.toFixed(1)}</span>
					</h2>
					<div className="px-2">
						{/* 사진 모음 */}
						<div className={styles.allReviewImages}>
							{initReviewImageList.map((image, index) => (
								<button
									key={`allReviewImage-${image.fileId}`}
									className={clsx(styles.reviewImageButton)}
									onClick={() => {
										handleOpenProductReviewModal(image.reviewImageId);
									}}
								>
									<SmartImage src={getUploadImageUrl(image.filePath)} alt={image.fileName} fill objectFit="contain" />
									{index === 6 && <div className={styles.moreCount}>더보기+</div>}
								</button>
							))}
						</div>
						<ProductReviewList
							productReviewData={productReviewData}
							turnPage={(page) => setReviewPage(page)}
							openReviewModal={handleOpenProductReviewModal}
						/>
					</div>
				</section>
			)}
		</>
	);
}
