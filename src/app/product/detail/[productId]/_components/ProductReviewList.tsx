import { TurnToPagination } from "@/components/ui/TurnToPagination";
import styles from "../ProductDetail.module.scss";
import { ProductReviewItem } from "@/types/product";
import { ReviewStar } from "@/components/product/ReviewStar";
import moment from "moment";
import { SmartImage } from "@/components/ui/SmartImage";
import { getUploadImageUrl } from "@/lib/image";
import { useEffect, useState } from "react";

interface ProductReviewListProps {
	productReviewList: ProductReviewItem[];
}

export default function ProductReviewList({ productReviewList = [] }: ProductReviewListProps) {
	// ----------------------------------------------------------------
	// React
	// ----------------------------------------------------------------

	// review 페이징 객체
	const [reviewPage, setReviewPage] = useState({
		page: 1,
		totalPage: 1,
	});

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
			<div>
				{/* 리뷰리스트 : 사진, 별점, 아이디(필터링), 내용, 작성날짜 */}
				<div className="">
					{productReviewList.map((review) => (
						<div key={`review-${review.reviewId}`} className="mt-2">
							<div className="flex justify-between">
								<div className="flex">
									<ReviewStar rate={review.rating} size={15} />
									<span className="inline-flex items-center mt-1 ml-2 text-sm">{review.userName}</span>
								</div>
								<div>{moment(review.reviewDate).format("YYYY.MM.DD")}</div>
							</div>
							<div className="flex justify-between">
								<span className="content-center">{review.content}</span>
								{review.reviewImages.length > 0 && (
									<span>
										<SmartImage
											src={getUploadImageUrl(review.reviewImages[0].storeName)}
											alt={review.reviewImages[0].fileName}
											width={50}
											height={50}
										/>
									</span>
								)}
							</div>
						</div>
					))}
				</div>
				{/* 리뷰 페이지네이션 */}
				<TurnToPagination
					curPage={reviewPage.page}
					totalPage={reviewPage.totalPage}
					turnPage={(page) => setReviewPage((prev) => ({ ...prev, page }))}
				/>
			</div>
		);
}
