import { ModalFrame } from "@/components/modal/frame/ModalFrame";
import { DomainModalPropsMap } from "@/store/modal.type";
import styles from "./ProductReviewModal.module.scss";
import { SmartImage } from "@/components/ui/SmartImage";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ReviewStar } from "@/components/product/ReviewStar";
import moment from "moment";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getUploadImageUrl } from "@/lib/image";
import { useAuth } from "@/hooks/context/useAuth";
import { ProductReviewItem } from "@/types/product";

// 중복 리뷰 제거
const mergeUniqueReviews = (list: ProductReviewItem[]) => {
	const map = new Map<number, ProductReviewItem>();

	list.forEach((review) => {
		map.set(review.reviewId, review);
	});

	return Array.from(map.values());
};
type ProductReviewModalProps = {
	onClose: () => void;
} & DomainModalPropsMap["PRODUCT_REVIEW"];
export const ProductReviewModal = ({
	onClose,
	reviewImageId,
	initReviewList,
	initPrevPage,
	initNextPage,
	fetchMoreReviewImages,
}: ProductReviewModalProps) => {
	// 1) [store / custom hooks] -------------------------------------------
	const router = useRouter();
	const { openDialog } = useGlobalDialogStore();
	const { user } = useAuth();

	// 2) [useState / useRef] ----------------------------------------------
	const [currentIndex, setCurrentIndex] = useState(0);
	const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const [reviewList, setReviewList] = useState(initReviewList);
	const [prevPage, setPrevPage] = useState(initPrevPage);
	const [nextPage, setNextPage] = useState(initNextPage);

	// 4) [derived values / useMemo] ---------------------------------------
	const reviewImageList = useMemo(() => {
		return reviewList.map((review) => review.reviewImages).flat();
	}, [reviewList]);
	const { reviewRate, reviewWriter, reviewContent, reviewDate, isMyReview, reviewImage } = useMemo(() => {
		const curReviewId = reviewImageList[currentIndex].reviewId;
		const currentReview = reviewList.find((review) => review.reviewId === curReviewId)!;

		return {
			reviewRate: currentReview.rating,
			reviewWriter: currentReview.userName,
			reviewContent: currentReview.content,
			reviewDate: currentReview.reviewDate,
			isMyReview: currentReview.userName === user?.name,
			reviewImage: reviewImageList[currentIndex],
		};
	}, [currentIndex, reviewImageList, reviewList, user]);

	// 5) [handlers / useCallback] -----------------------------------------
	const prepareReviewModalList = useCallback(async () => {
		const beforeCount = currentIndex;
		const afterCount = reviewImageList.length - currentIndex - 1;
		const currentImage = reviewImageList[currentIndex];

		if (!currentImage) return;

		if (beforeCount >= 3 && afterCount >= 3) return;

		const prepared = await fetchMoreReviewImages({
			clickedReviewImageId: currentImage.reviewImageId,
			baseReviewList: reviewList,
			startPage: beforeCount < 3 ? prevPage : nextPage,
		});

		setReviewList(mergeUniqueReviews(prepared.reviewList));
		setPrevPage(prepared.prevPage);
		setNextPage(prepared.nextPage);
	}, [currentIndex, reviewImageList, reviewList, prevPage, nextPage, fetchMoreReviewImages]);

	// 6) [useEffect] ------------------------------------------------------
	useEffect(() => {
		setCurrentIndex(reviewImageList.findIndex((image) => image.reviewImageId === reviewImageId) ?? 0);
	}, [reviewImageId, reviewImageList]);
	useEffect(() => {
		thumbRefs.current[currentIndex]?.scrollIntoView({
			behavior: "smooth",
			block: "nearest",
			inline: "center",
		});
		prepareReviewModalList();
	}, [currentIndex, prepareReviewModalList]);

	return (
		<ModalFrame title="제품 리뷰" onClose={onClose}>
			<div className={styles.productReviewModal}>
				{/* 이미지 선택 슬라이드 */}
				<header className={styles.thumbRow}>
					<div className={styles.thumbList}>
						{reviewImageList.map((image, index) => (
							<button
								key={image.reviewImageId}
								ref={(el) => {
									thumbRefs.current[index] = el;
								}}
								type="button"
								className={clsx(styles.thumbItem, currentIndex === index && styles.active)}
								onClick={() => setCurrentIndex(index)}
							>
								<SmartImage
									src={getUploadImageUrl(image.filePath)}
									alt={image.fileName}
									fill
									objectFit="contain"
									copyright={image.copyright}
									copyrightUrl={image.copyrightUrl}
								/>
							</button>
						))}
					</div>
				</header>
				{/* 확대 이미지 & 왼쪽오른쪽 이동 버튼 */}
				<nav>
					<button
						onClick={() => {
							if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
						}}
					>
						<FaChevronLeft />
					</button>
					<div className={styles.reviewImageContainer}>
						<SmartImage
							src={getUploadImageUrl(reviewImage.filePath)}
							alt={reviewImage.fileName}
							fill
							objectFit="contain"
							copyright={reviewImage.copyright}
							copyrightUrl={reviewImage.copyrightUrl}
						/>
					</div>
					<button
						onClick={() => {
							if (currentIndex < reviewImageList.length - 1) setCurrentIndex((prev) => prev + 1);
						}}
					>
						<FaChevronRight />
					</button>
				</nav>
				{/* 리뷰 내용 */}
				<section className="px-3 mt-4">
					<div className="flex justify-between">
						<div className="flex">
							<ReviewStar rate={reviewRate} size={15} />
							<span className="inline-flex items-center mt-1 ml-2 text-sm">{reviewWriter}</span>
						</div>
						<div>{moment(reviewDate).format("YYYY.MM.DD")}</div>
					</div>
					<div className="flex justify-between py-3">
						<span className={clsx(styles.reviewContent, "content-center")}>{reviewContent}</span>
					</div>
					{isMyReview && (
						<div className="px-3 pb-2 text-right">
							{/* 작성 7일까지 수정가능 */}
							{moment(new Date()).isSameOrAfter(moment().subtract(7, "days"), "day") && (
								<button
									className="text-base text-orange-400"
									onClick={() => {
										router.push(`/mypage/review/1321321`);
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
											// deleteReview(review.reviewId);
										},
									});
								}}
							>
								삭제하기
							</button>
						</div>
					)}
				</section>
			</div>
		</ModalFrame>
	);
};
