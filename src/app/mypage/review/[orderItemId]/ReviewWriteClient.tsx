"use client";

import { FormPageShell } from "@/components/form/FormPageShell";
import styles from "./ReviewWrite.module.scss";
import { money } from "@/lib/format";
import { SmartImage } from "@/components/ui/SmartImage";
import { getOrderStatusLabel } from "@/lib/order";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getNormal, postJson, postMultipart, putJson } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { useEffect, useState } from "react";
import {
	ReviewImage,
	ReviewInfo,
	ReviewOrderInfoResponse,
	ReviewOrderItem,
	SetReviewImageRequest,
	UpdateReviewRequest,
	WriteReviewRequest,
} from "@/types/mypage";
import { ReviewStar } from "@/components/product/ReviewStar";
import { InfoMark } from "@/components/form/InfoMark";
import { ImageDragInputArea } from "@/components/form/ImageDragInputArea";
import { FormActionButton } from "@/components/form/FormActionButton";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import { BaseResponse } from "@/types/common";
import { getUploadImageUrl } from "@/lib/image";

type PrevImageItem = ReviewImage & {
	type: "prev";
	deleting: boolean;
};
type ImageItem = {
	type: "new";
	file: File;
	uploadTime: number;
	previewUrl: string;
	sortKey: number;
	deleting: boolean;
};

export default function ReviewWriteClient() {
	// 1) [store / custom hooks] -------------------------------------------
	const params = useParams();
	const orderItemId = Number(params.orderItemId);
	const { openDialog } = useGlobalDialogStore();
	const router = useRouter();

	// 2) [useState / useRef] ----------------------------------------------
	const [reviewForm, setReviewForm] = useState({
		rating: 0,
		content: "",
	});
	const [prevReviewList, setPrevReviewList] = useState<PrevImageItem[]>([]);
	const [newReviewFiles, setNewReviewFiles] = useState<ImageItem[]>([]);
	const [deleteImageIds, setDeleteImageIds] = useState<number[]>([]);

	// 3) [useQuery / useMutation] -----------------------------------------
	// 리뷰 주문정보 조회
	const {
		data: { reviewOrderItem, prevReview } = {
			reviewOrderItem: null,
			prevReview: null,
		},
	} = useQuery<
		ReviewOrderInfoResponse,
		Error,
		{
			reviewOrderItem: ReviewOrderItem;
			prevReview: ReviewInfo | null;
		}
	>({
		queryKey: ["reviewOrderItem", orderItemId],
		queryFn: () => getNormal(getApiUrl(API_URL.MY_REVIEW), { orderItemId }),
		enabled: !!orderItemId,
		select: (data) => ({
			reviewOrderItem: data.reviewOrderItem,
			prevReview: data.review,
		}),
	});
	// 리뷰 작성
	const { mutateAsync: writeReview } = useMutation<BaseResponse & { reviewId: number }, Error, WriteReviewRequest>({
		mutationFn: (productForm: WriteReviewRequest) =>
			postJson(getApiUrl(API_URL.MY_REVIEW), {
				...productForm,
			}),
	});
	// 리뷰 수정
	const { mutateAsync: updateReview } = useMutation<BaseResponse, Error, UpdateReviewRequest>({
		mutationFn: (productForm: UpdateReviewRequest) =>
			putJson(getApiUrl(API_URL.MY_REVIEW), {
				...productForm,
			}),
	});
	// 리뷰 이미지 설정
	const { mutateAsync: setReviewImage } = useMutation<BaseResponse, Error, SetReviewImageRequest>({
		mutationFn: ({ reviewId, files, addFiles, updateFiles, deleteImageIds }: SetReviewImageRequest) => {
			const formData = new FormData();
			formData.append(
				"request",
				JSON.stringify({
					reviewId,
					addFiles,
					updateFiles,
					deleteImageIds,
				}),
			);
			files.forEach((file) => {
				formData.append("files", file);
			});

			return postMultipart(getApiUrl(API_URL.MY_REVIEW_IMAGE), formData);
		},
	});

	// 5) [handlers / useCallback] -----------------------------------------
	// 리뷰 작성/수정 제출
	const handleReviewSubmit = () => {
		if (!reviewForm.rating) {
			openDialog("ALERT", {
				content: "별점을 선택해주세요.",
			});
			return;
		}
		if (!reviewForm.content) {
			openDialog("ALERT", {
				content: "리뷰 내용을 입력해주세요.",
			});
			return;
		}
		// addFiles, updateFiles, deleteImageIds
		const addFiles = [
			...newReviewFiles
				.filter((item) => !item.deleting)
				.map((item) => ({
					file: item.file,
					sortKey: item.sortKey,
				})),
		];
		const updateFiles = [
			...prevReviewList
				.filter((item) => !item.deleting)
				.map((item) => ({
					reviewImageId: item.reviewImageId,
					sortKey: item.sortKey,
				})),
		];

		// 리뷰 작성/수정 유효성 검사
		console.log({ reviewForm, addFiles, updateFiles, deleteImageIds });
		// return;

		// 리뷰 작성
		if (!prevReview) {
			writeReview({
				content: reviewForm.content,
				rating: reviewForm.rating,
				orderItemId,
			}).then((response) => {
				reviewImageSubmit(response.reviewId);
			});
		}
		// 리뷰 수정
		else {
			updateReview({
				reviewId: prevReview.reviewId,
				content: reviewForm.content,
				rating: reviewForm.rating,
			}).then(() => {
				reviewImageSubmit(prevReview.reviewId);
			});
		}

		function reviewImageSubmit(reviewId: number) {
			const addFilesMeta = addFiles.map((item, index) => {
				const clientKey = `new-file-${index}-${item.sortKey}`;

				return {
					clientKey,
					sortKey: item.sortKey,
					fileName: item.file.name,
				};
			});
			setReviewImage({
				files: [...addFiles.map((file) => file.file)], // File 객체 배열로 변환
				reviewId,
				addFiles: addFilesMeta,
				updateFiles,
				deleteImageIds,
			}).then(() => {
				openDialog("ALERT", {
					content: prevReview ? "리뷰가 수정되었습니다." : "리뷰가 작성되었습니다.",
					handleAfterClose: () => {
						router.push(`/product/detail/${reviewOrderItem?.productId}?tab=review`);
					},
				});
			});
		}
	};

	// 6) [useEffect] ------------------------------------------------------
	useEffect(() => {
		if (reviewOrderItem) {
			console.log("reviewOrderItem", reviewOrderItem);
		}
		if (prevReview) {
			console.log({ prevReview });
			setReviewForm({
				rating: prevReview.rating,
				content: prevReview.content,
			});
			setPrevReviewList(prevReview.reviewImages.map((image) => ({ ...image, type: "prev", deleting: false })) || []);
		}
	}, [reviewOrderItem, prevReview]);

	if (!reviewOrderItem) return null;
	return (
		<div className={styles.reviewWrite}>
			<FormPageShell title={prevReview ? "리뷰 수정" : "리뷰 작성"} formWidth={600} wrapMinHeight={100} overflow="visible">
				<div>
					<div className={styles.orderHistoryItem}>
						<h5 className={styles.orderHistoryStatus}>{getOrderStatusLabel(reviewOrderItem.status)}</h5>

						{/* 상품 정보 */}
						<div className={styles.orderHistoryProduct}>
							<div className={styles.orderHistoryThumb}>
								<SmartImage fill src={getUploadImageUrl(reviewOrderItem.filePath)} alt={reviewOrderItem.productName + " 이미지"} />
							</div>

							<div className={styles.orderHistoryInfo}>
								<h4 className={styles.orderHistoryBrand}>{reviewOrderItem.sellerName}</h4>
								<p className={styles.orderHistoryName}>{reviewOrderItem.productName}</p>
								<h5 className={styles.orderHistoryOption}>
									{reviewOrderItem.size}
									{reviewOrderItem.addPrice > 0 ? `(+${money(reviewOrderItem.addPrice)})` : ""} / {reviewOrderItem.count}개
								</h5>
								<h6 className={styles.orderHistoryPrice}>{money(reviewOrderItem.finalPrice)}원</h6>
							</div>
						</div>
						<div className="mt-2">
							<InfoMark
								title="별점"
								infoVal={
									<span className="inline-flex">
										<ReviewStar
											rate={reviewForm.rating}
											clickable
											size={25}
											onClick={(rate) => setReviewForm({ ...reviewForm, rating: rate })}
											starColor="rgb(239 223 0)"
										/>
									</span>
								}
							/>
							<div className="mt-5">
								<InfoMark
									title="리뷰 내용"
									infoVal={
										<span className={styles.reviewContent}>
											<textarea
												className="resize-none"
												cols={45}
												rows={5}
												value={reviewForm.content}
												onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
											/>
										</span>
									}
								/>
							</div>
							<div className={"my-3"}>
								<ImageDragInputArea
									variant="review"
									title="리뷰 이미지"
									prevFileList={prevReviewList}
									setDeleteImageIds={setDeleteImageIds}
									changePrevFileList={(prev) => setPrevReviewList(prev)}
									newFileList={newReviewFiles}
									changeNewFileList={(newFiles) => setNewReviewFiles(newFiles)}
								/>
							</div>
						</div>
						<FormActionButton type="info" title="완료" btnType="button" onClick={handleReviewSubmit} />
					</div>
				</div>
			</FormPageShell>
		</div>
	);
}
