import { TurnToPagination } from "@/components/ui/TurnToPagination";
import styles from "../ProductDetail.module.scss";
import { GetProductDetailReviewResponse } from "@/types/product";
import { ReviewStar } from "@/components/product/ReviewStar";
import moment from "moment";
import { SmartImage } from "@/components/ui/SmartImage";
import { getUploadImageUrl } from "@/lib/image";
import clsx from "clsx";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { deleteNormal } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { useGlobalDialogStore } from "@/store/globalDialog.store";

interface ProductReviewListProps {
	productReviewData: GetProductDetailReviewResponse;
	turnPage: (page: number) => void;
}

export default function ProductReviewList({ productReviewData, turnPage }: ProductReviewListProps) {
	// 1) [store / custom hooks] -------------------------------------------
	const router = useRouter();
	const { user } = useAuth();
	const params = useParams<{
		productId: string;
	}>();
	const productId = Number(params.productId);
	const { openDialog } = useGlobalDialogStore();
	const queryClient = useQueryClient();

	// 2) [useState / useRef] ----------------------------------------------

	// 3) [useQuery / useMutation] -----------------------------------------
	const { mutateAsync: deleteReview } = useMutation({
		mutationFn: async (reviewId: number) =>
			deleteNormal(getApiUrl(API_URL.PRODUCT_DETAIL_REVIEW_DELETE), {
				productId,
				reviewId,
			}),
		onSuccess() {
			const currentList = productReviewData?.productReviewList ?? [];
			const currentPage = productReviewData?.page ?? 1;

			// 마지막 페이지에 리뷰가 1개 남았을 경우, 이전 페이지로 이동
			if (currentList.length === 1 && currentPage > 1) {
				turnPage(currentPage - 1);
				return;
			}

			queryClient.invalidateQueries({
				queryKey: ["productReviewList", productId],
			});
		},
	});

	// 4) [derived values / useMemo] ---------------------------------------
	const productReviewList = productReviewData.productReviewList || [];
	const page = productReviewData.page || 1;
	const totalPage = productReviewData.totalPage || 1;

	// 6) [useEffect] ------------------------------------------------------

	if (productReviewList.length > 0)
		return (
			<div className={styles.productReviewList}>
				{/* 리뷰리스트 : 사진, 별점, 아이디(필터링), 내용, 작성날짜 */}
				<div className="mt-4">
					{productReviewList.map((review) => {
						// 본인 review 여부
						const isMyReview = review.userName === user?.name;
						return (
							<div key={`review-${review.reviewId}`} className={clsx(styles.reviewItem, "mt-2", isMyReview && "bg-orange-50")}>
								<div className="flex justify-between">
									<div className="flex">
										<ReviewStar rate={review.rating} size={15} />
										<span className="inline-flex items-center mt-1 ml-2 text-sm">{review.userName}</span>
									</div>
									<div>{moment(review.reviewDate).format("YYYY.MM.DD")}</div>
								</div>
								<div className="flex justify-between py-3">
									<span className={clsx(styles.reviewContent, "content-center")}>{review.content}</span>
									{review.reviewImages.length > 0 && (
										<button className={styles.reviewImages}>
											<SmartImage
												src={getUploadImageUrl(review.reviewImages[0].filePath)}
												alt={review.reviewImages[0].fileName}
												width={50}
												height={50}
												objectFit="contain"
											/>
										</button>
									)}
								</div>
								{isMyReview && (
									<div className="px-3 pb-2 text-right">
										{/* 작성 7일까지 수정가능 */}
										{moment(review.reviewDate).isSameOrAfter(moment().subtract(7, "days"), "day") && (
											<button
												className="text-base text-orange-400"
												onClick={() => {
													router.push(`/mypage/review/${review.orderItemId}`);
												}}
											>
												수정하기
											</button>
										)}
										<button
											className="ml-2 text-base text-red-600"
											onClick={() => {
												openDialog("CONFIRM", {
													content: "리뷰를 삭제하시겠습니까?",
													handleAfterOk: () => {
														deleteReview(review.reviewId);
													},
												});
											}}
										>
											삭제하기
										</button>
									</div>
								)}
							</div>
						);
					})}
				</div>
				{/* 리뷰 페이지네이션 */}
				<div className="mt-5 mb-16">
					<TurnToPagination curPage={page} totalPage={totalPage} turnPage={(page) => turnPage(page)} />
				</div>
			</div>
		);
}
