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
import { useEffect, useRef, useState } from "react";

type ProductReviewModalProps = {
	onClose: () => void;
} & DomainModalPropsMap["PRODUCT_REVIEW"];

export const ProductReviewModal = ({ onClose, reviewImageId }: ProductReviewModalProps) => {
	// 1) [store / custom hooks] -------------------------------------------
	const router = useRouter();
	const { openDialog } = useGlobalDialogStore();

	// 2) [useState / useRef] ----------------------------------------------
	const [currentIndex, setCurrentIndex] = useState(0);
	const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

	// 4) [derived values / useMemo] ---------------------------------------
	const isMyReview = true;

	// 6) [useEffect] ------------------------------------------------------
	useEffect(() => {
		thumbRefs.current[currentIndex]?.scrollIntoView({
			behavior: "smooth",
			block: "nearest",
			inline: "center",
		});
	}, [currentIndex]);

	return (
		<ModalFrame title="제품 리뷰" onClose={onClose}>
			<div className={styles.productReviewModal}>
				{/* 이미지 선택 슬라이드 */}
				<header className={styles.thumbRow}>
					{/* {imageList.map((image, index) => (
						<button
							key={image.reviewImageId}
							ref={(el) => {
								thumbRefs.current[index] = el;
							}}
							type="button"
							className={clsx(styles.thumbItem, currentIndex === index && styles.active)}
							onClick={() => setCurrentIndex(index)}
						>
							<SmartImage src={image.filePath} alt="" fill />
						</button>
					))} */}
				</header>
				{/* 확대 이미지 & 왼쪽오른쪽 이동 버튼 */}
				<nav>
					<button>
						<FaChevronLeft />
					</button>
					<div className={styles.reviewImageContainer}>
						<SmartImage fill objectFit="contain" />
					</div>
					<button>
						<FaChevronRight />
					</button>
				</nav>
				{/* 리뷰 내용 */}
				<section className="px-3 mt-4">
					<div className="flex justify-between">
						<div className="flex">
							<ReviewStar rate={3} size={15} />
							<span className="inline-flex items-center mt-1 ml-2 text-sm">리뷰자</span>
						</div>
						<div>{moment(new Date()).format("YYYY.MM.DD")}</div>
					</div>
					<div className="flex justify-between py-3">
						<span className={clsx(styles.reviewContent, "content-center")}>
							리뷰부엉이리뷰부엉이리뷰부엉이리뷰부엉이리뷰부엉이리뷰부엉이
							리뷰부엉이리뷰부엉이리뷰부엉이리뷰부엉이리뷰부엉이리뷰부엉이리뷰부엉이리뷰부엉이리뷰부엉이
						</span>
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
