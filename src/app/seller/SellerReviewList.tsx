import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { GetSellerReviewResponse, SellerReview } from "@/types/seller";
import { useQuery } from "@tanstack/react-query";
import styles from "./SellerMain.module.scss";
import { useEffect, useState } from "react";
import { TurnToPagination } from "@/components/ui/TurnToPagination";
import { SmartImage } from "@/components/ui/SmartImage";
import clsx from "clsx";
import { ReviewStar } from "@/components/product/ReviewStar";
import moment from "moment";
import { getUploadImageUrl } from "@/lib/image";

export default function SellerReviewList() {
	// 1) [store / custom hooks] -------------------------------------------
	const { loginOn } = useSellerAuth();

	// 2) [useState / useRef] ----------------------------------------------
	// review 페이징 객체
	const [reviewPage, setReviewPage] = useState({
		page: 1,
		totalPage: 1,
	});

	// 3) [useQuery / useMutation] -----------------------------------------
	// 판매자 리뷰 조회
	const {
		data: { sellerReviewList } = { sellerReviewList: [] },
		// isFetching,
	} = useQuery<GetSellerReviewResponse, Error, { sellerReviewList: SellerReview[] }>({
		queryKey: ["sellerReviewList"],
		queryFn: () => getNormal(getApiUrl(API_URL.SELLER_REVIEW)),
		select: (data) => {
			return {
				sellerReviewList: data.sellerReviewList,
			};
		},
		enabled: loginOn,
		refetchOnWindowFocus: false,
	});

	// 6) [useEffect] ------------------------------------------------------
	useEffect(() => {
		if (sellerReviewList.length > 0) {
			const totalPage = Math.ceil(sellerReviewList.length / 10);
			setReviewPage({
				page: 1,
				totalPage,
			});
		}
	}, [sellerReviewList]);

	return (
		<div id="ReviewList" className={styles.reviewList}>
			<h2>
				<span>리뷰</span>
			</h2>
			<article className="px-4 py-3 bg-gray-100">
				<section className="mt-3">
					<div className={styles.productReviewList}>
						{/* 리뷰리스트 : 사진, 별점, 아이디(필터링), 내용, 작성날짜 */}
						<div className="mt-4">
							{sellerReviewList.map((review) => {
								return (
									<div key={`review-${review.reviewId}`} className={clsx(styles.reviewItem, "mt-2")}>
										<div className="flex justify-between">
											<div className="flex">
												<ReviewStar rate={review.rating} size={15} />
												<span className="inline-flex items-center mt-1 ml-2 text-sm">{review.userName}</span>
											</div>
											<div>{moment(review.createdAt).format("YYYY.MM.DD")}</div>
										</div>
										<div className="flex justify-between py-3">
											<span className={clsx(styles.reviewContent, "content-center")}>{review.content}</span>
											{!!review.reviewImageId && (
												<button className={styles.reviewImages}>
													<SmartImage
														src={getUploadImageUrl(review.filePath)}
														alt={review.fileName}
														width={50}
														height={50}
														objectFit="contain"
													/>
												</button>
											)}
										</div>
									</div>
								);
							})}
						</div>
						{/* 리뷰 페이지네이션 */}
						<div className="mt-5">
							<TurnToPagination
								curPage={reviewPage.page}
								totalPage={reviewPage.totalPage}
								turnPage={(page) => setReviewPage((prev) => ({ ...prev, page }))}
							/>
						</div>
					</div>
				</section>
			</article>
		</div>
	);
}
