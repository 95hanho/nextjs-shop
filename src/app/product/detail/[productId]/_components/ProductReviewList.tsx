import { TurnToPagination } from "@/components/ui/TurnToPagination";
import styles from "../ProductDetail.module.scss";
import { ProductReviewItem } from "@/types/product";
import { ReviewStar } from "@/components/product/ReviewStar";
import moment from "moment";
import { SmartImage } from "@/components/ui/SmartImage";
import { getUploadImageUrl } from "@/lib/image";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { deleteNormal } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { useGlobalDialogStore } from "@/store/globalDialog.store";

interface ProductReviewListProps {
	productReviewList: ProductReviewItem[];
}

export default function ProductReviewList({ productReviewList = [] }: ProductReviewListProps) {
	// 1) [store / custom hooks] -------------------------------------------
	const { user } = useAuth();
	const params = useParams<{
		productId: string;
	}>();
	const productId = Number(params.productId);
	const { openDialog } = useGlobalDialogStore();
	const queryClient = useQueryClient();

	// 2) [useState / useRef] ----------------------------------------------
	// review 페이징 객체
	const [reviewPage, setReviewPage] = useState({
		page: 1,
		totalPage: 1,
	});

	// 3) [useQuery / useMutation] -----------------------------------------
	const { mutateAsync: deleteReview } = useMutation({
		mutationFn: async (reviewId: number) =>
			deleteNormal(getApiUrl(API_URL.PRODUCT_DETAIL_REVIEW_DELETE), {
				productId,
				reviewId,
			}),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ["productReviewList", productId] });
		},
	});

	// 6) [useEffect] ------------------------------------------------------
	useEffect(() => {
		if (productReviewList.length > 0) {
			const totalPage = Math.ceil(productReviewList.length / 10);
			setReviewPage({
				page: 1,
				totalPage,
			});
		}
	}, [productReviewList]);

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
										<button
											className="text-base text-red-600"
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
					<TurnToPagination
						curPage={reviewPage.page}
						totalPage={reviewPage.totalPage}
						turnPage={(page) => setReviewPage((prev) => ({ ...prev, page }))}
					/>
				</div>
			</div>
		);
}
