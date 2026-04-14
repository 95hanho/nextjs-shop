import styles from "./ProductSet.module.scss";
import { AddFile, ProductImage, UpdateFile } from "@/types/seller";
import { SmartImage } from "@/components/ui/SmartImage";
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { FiMove } from "react-icons/fi";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import { getUploadImageUrl } from "@/lib/image";

type PrevImageItem = ProductImage & {
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

interface ProductImageSetProps {
	prevImageList?: ProductImage[];
	imageUpdatedAt?: string;
}

export type ProductImageSetHandle = {
	getSubmitData: () =>
		| {
				addFiles: AddFile[];
				updateFiles: UpdateFile[];
				deleteImageIds: number[];
		  }
		| undefined;
};

export const ProductImageSet = forwardRef<ProductImageSetHandle, ProductImageSetProps>(({ prevImageList, imageUpdatedAt }, ref) => {
	const { openDialog } = useGlobalDialogStore();

	// ------------------------------------------------
	// React
	// ------------------------------------------------

	const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
	const detailInputRef = useRef<HTMLInputElement | null>(null);
	const thumbnailDragCountRef = useRef(0);
	const detailDragCountRef = useRef(0);

	const [prevThumbnailList, setPrevThumbnailList] = useState<PrevImageItem[]>([]);
	const [prevDetailList, setPrevDetailList] = useState<PrevImageItem[]>([]);

	const [newThumbnailFiles, setNewThumbnailFiles] = useState<ImageItem[]>([]);
	const [newDetailFiles, setNewDetailFiles] = useState<ImageItem[]>([]);

	const [deleteImageIds, setDeleteImageIds] = useState<number[]>([]);

	// ------------------------------------------------
	const [draggingItemKey, setDraggingItemKey] = useState<string | null>(null);
	const [dragPreview, setDragPreview] = useState<{
		src: string;
		x: number;
		y: number;
	} | null>(null);

	//
	const [thumbnailInsertIndex, setThumbnailInsertIndex] = useState<number | null>(null);
	const [draggingThumbnailIndex, setDraggingThumbnailIndex] = useState<number | null>(null);
	const [detailInsertIndex, setDetailInsertIndex] = useState<number | null>(null);
	const [draggingDetailIndex, setDraggingDetailIndex] = useState<number | null>(null);

	// 드래그 앤 드롭 상태
	const [isThumbnailDragging, setIsThumbnailDragging] = useState(false);
	const [isDetailDragging, setIsDetailDragging] = useState(false);

	const validateImageFiles = (files: File[]) => {
		return files.filter((file) => {
			const mimeOk = file.type.startsWith("image/");
			const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
			const allowedExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
			const extOk = allowedExtensions.includes(ext);
			return mimeOk && extOk;
		});
	};
	const addFiles = (files: File[], type: "thumbnail" | "detail") => {
		const validFiles = validateImageFiles(files);

		if (validFiles.length !== files.length) {
			openDialog("ALERT", {
				content: "이미지 파일만 업로드할 수 있습니다.",
			});
			return;
		}

		if (type === "thumbnail") {
			const lastSortKey = thumbnailList[thumbnailList.length - 1]?.sortKey ?? 0;
			setNewThumbnailFiles((prev) => [
				...prev,
				...validFiles.map<ImageItem>((file, index) => ({
					file,
					type: "new",
					previewUrl: URL.createObjectURL(file),
					uploadTime: new Date().getTime(),
					sortKey: lastSortKey + (index + 1) * 100,
					deleting: false,
				})),
			]);
		} else {
			const lastSortKey = detailImageList[detailImageList.length - 1]?.sortKey ?? 0;
			setNewDetailFiles((prev) => [
				...prev,
				...validFiles.map<ImageItem>((file, index) => ({
					file,
					type: "new",
					previewUrl: URL.createObjectURL(file),
					uploadTime: new Date().getTime(),
					sortKey: lastSortKey + (index + 1) * 100,
					deleting: false,
				})),
			]);
		}
	};
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		const fileArray = Array.from(files);
		const type = e.target.name === "thumbnailImages" ? "thumbnail" : "detail";

		addFiles(fileArray, type);
		e.target.value = "";
	};
	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};
	const handleDragEnter = (type: "thumbnail" | "detail") => {
		if (draggingItemKey) return; // 드래그 중인 이미지 있을 때는 무시
		if (type === "thumbnail") {
			thumbnailDragCountRef.current += 1;
			setIsThumbnailDragging(true);
		} else {
			detailDragCountRef.current += 1;
			setIsDetailDragging(true);
		}
	};
	const handleDragLeave = (type: "thumbnail" | "detail") => {
		if (draggingItemKey) return; // 드래그 중인 이미지 있을 때는 무시
		if (type === "thumbnail") {
			thumbnailDragCountRef.current -= 1;

			if (thumbnailDragCountRef.current <= 0) {
				thumbnailDragCountRef.current = 0;
				setIsThumbnailDragging(false);
			}
		} else {
			detailDragCountRef.current -= 1;

			if (detailDragCountRef.current <= 0) {
				detailDragCountRef.current = 0;
				setIsDetailDragging(false);
			}
		}
	};
	const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: "thumbnail" | "detail") => {
		if (draggingItemKey) return; // 드래그 중인 이미지 있을 때는 무시
		e.preventDefault();
		e.stopPropagation();

		const files = Array.from(e.dataTransfer.files || []);
		if (files.length === 0) {
			if (type === "thumbnail") {
				thumbnailDragCountRef.current = 0;
				setIsThumbnailDragging(false);
			} else {
				detailDragCountRef.current = 0;
				setIsDetailDragging(false);
			}
			return;
		}

		addFiles(files, type);

		if (type === "thumbnail") {
			thumbnailDragCountRef.current = 0;
			setIsThumbnailDragging(false);
		} else {
			detailDragCountRef.current = 0;
			setIsDetailDragging(false);
		}
	};
	const getItemKey = (item: PrevImageItem | ImageItem) => {
		if (item.type === "prev") {
			return `prev-${item.fileId}`;
		}
		return `new-${item.file.name}-${item.uploadTime}`;
	};
	const handleImageDragStart = (
		e: React.DragEvent<HTMLDivElement>,
		item: PrevImageItem | ImageItem,
		index: number,
		type: "thumbnail" | "detail",
	) => {
		e.stopPropagation();

		const src = item.type === "prev" ? getUploadImageUrl(item.storeName) : item.previewUrl;
		const itemKey = getItemKey(item);

		setDraggingItemKey(itemKey);
		if (type === "thumbnail") {
			setDraggingThumbnailIndex(index);
		} else {
			setDraggingDetailIndex(index);
		}
		setDragPreview({
			src: src || "",
			x: e.clientX,
			y: e.clientY,
		});

		// 기본 브라우저 drag 이미지 숨기기
		const emptyImage = new Image();
		emptyImage.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
		e.dataTransfer.setDragImage(emptyImage, 0, 0);
	};
	const handleImageDrag = (e: React.DragEvent<HTMLDivElement>) => {
		if (e.clientX === 0 && e.clientY === 0) return;

		setDragPreview((prev) => {
			if (!prev) return null;
			return {
				...prev,
				x: e.clientX,
				y: e.clientY,
			};
		});
	};
	const handleImageDragEnd = (type: "thumbnail" | "detail") => {
		handleImageSortDrop(type);
		setDraggingThumbnailIndex(null);
		setDraggingDetailIndex(null);
		setDraggingItemKey(null);
		setDragPreview(null);
		setThumbnailInsertIndex(null);
		setDetailInsertIndex(null);
	};
	// 삽입 위치 계산
	const handleItemDragOver = (e: React.DragEvent<HTMLDivElement>, index: number, type: "thumbnail" | "detail") => {
		if (!draggingItemKey) return;

		e.preventDefault();
		e.stopPropagation();

		const rect = e.currentTarget.getBoundingClientRect();
		const middleX = rect.left + rect.width / 2;

		if (type === "thumbnail") {
			if (e.clientX < middleX) {
				setThumbnailInsertIndex(index);
			} else {
				setThumbnailInsertIndex(index + 1);
			}
		} else {
			if (e.clientX < middleX) {
				setDetailInsertIndex(index);
			} else {
				setDetailInsertIndex(index + 1);
			}
		}
	};
	// 재정렬 함수
	const handleImageSortDrop = (type: "thumbnail" | "detail") => {
		if (type === "thumbnail") {
			if (draggingThumbnailIndex === null || thumbnailInsertIndex === null) return;

			const reorderedList = [...thumbnailList];
			const [movedItem] = reorderedList.splice(draggingThumbnailIndex, 1);

			let nextInsertIndex = thumbnailInsertIndex;
			if (draggingThumbnailIndex < thumbnailInsertIndex) {
				nextInsertIndex -= 1;
			}

			// 드래그한 아이템이 현재 위치에서 이동하려는 위치로 바로 옆으로 이동하는 경우는 무시
			if (draggingThumbnailIndex === nextInsertIndex) return;
			if (draggingThumbnailIndex + 1 === thumbnailInsertIndex) return;

			reorderedList.splice(nextInsertIndex, 0, movedItem);

			const updatedList = reorderedList.map((item, index) => ({
				...item,
				sortKey: (index + 1) * 100,
			}));

			setPrevThumbnailList([
				...(updatedList.filter((item) => item.type === "prev") as PrevImageItem[]),
				...(deletingThumbnailList.filter((item) => item.type === "prev") as PrevImageItem[]),
			]);
			setNewThumbnailFiles([
				...(updatedList.filter((item) => item.type === "new") as ImageItem[]),
				...(deletingThumbnailList.filter((item) => item.type === "new") as ImageItem[]),
			]);
		} else {
			if (draggingDetailIndex === null || detailInsertIndex === null) return;

			const reorderedList = [...detailImageList];
			const [movedItem] = reorderedList.splice(draggingDetailIndex, 1);

			let nextInsertIndex = detailInsertIndex;
			if (draggingDetailIndex < detailInsertIndex) {
				nextInsertIndex -= 1;
			}

			// 드래그한 아이템이 현재 위치에서 이동하려는 위치로 바로 옆으로 이동하는 경우는 무시
			if (draggingDetailIndex === nextInsertIndex) return;
			if (draggingDetailIndex + 1 === detailInsertIndex) return;

			reorderedList.splice(nextInsertIndex, 0, movedItem);

			const updatedList = reorderedList.map((item, index) => ({
				...item,
				sortKey: (index + 1) * 100,
			}));

			setPrevDetailList([
				...(updatedList.filter((item) => item.type === "prev") as PrevImageItem[]),
				...(deletingDetailList.filter((item) => item.type === "prev") as PrevImageItem[]),
			]);
			setNewDetailFiles([
				...(updatedList.filter((item) => item.type === "new") as ImageItem[]),
				...(deletingDetailList.filter((item) => item.type === "new") as ImageItem[]),
			]);
		}
	};
	// 공용 정렬 함수
	const reassignSortKey = <T extends { sortKey: number; deleting: boolean }>(list: T[]) => {
		const activeList = list.filter((item) => !item.deleting);
		const deletingList = list.filter((item) => item.deleting);

		const updatedActiveList = activeList.map((item, index) => ({
			...item,
			sortKey: (index + 1) * 100,
		}));

		return [...updatedActiveList, ...deletingList];
	};
	//
	const handleImageDelete = (targetKey: string, type: "thumbnail" | "detail", fileId?: number) => {
		if (type === "thumbnail") {
			const updatedPrev = prevThumbnailList.map((item) => {
				const itemKey = getItemKey(item);
				return itemKey === targetKey ? { ...item, deleting: true } : item;
			});

			const updatedNew = newThumbnailFiles.map((item) => {
				const itemKey = getItemKey(item);
				return itemKey === targetKey ? { ...item, deleting: true } : item;
			});

			const merged = [...updatedPrev, ...updatedNew];
			const reordered = reassignSortKey(merged);

			setPrevThumbnailList(reordered.filter((item) => item.type === "prev") as PrevImageItem[]);
			setNewThumbnailFiles(reordered.filter((item) => item.type === "new") as ImageItem[]);
		} else {
			const updatedPrev = prevDetailList.map((item) => {
				const itemKey = getItemKey(item);
				return itemKey === targetKey ? { ...item, deleting: true } : item;
			});

			const updatedNew = newDetailFiles.map((item) => {
				const itemKey = getItemKey(item);
				return itemKey === targetKey ? { ...item, deleting: true } : item;
			});

			const merged = [...updatedPrev, ...updatedNew];
			const reordered = reassignSortKey(merged);

			setPrevDetailList(reordered.filter((item) => item.type === "prev") as PrevImageItem[]);
			setNewDetailFiles(reordered.filter((item) => item.type === "new") as ImageItem[]);
		}
		if (fileId) setDeleteImageIds((prev) => [...prev, fileId]);
	};
	//
	const handleImageRestore = (targetKey: string, type: "thumbnail" | "detail", fileId?: number) => {
		if (type === "thumbnail") {
			const updatedPrev = prevThumbnailList.map((item) => {
				const itemKey = getItemKey(item);
				return itemKey === targetKey ? { ...item, deleting: false } : item;
			});

			const updatedNew = newThumbnailFiles.map((item) => {
				const itemKey = getItemKey(item);
				return itemKey === targetKey ? { ...item, deleting: false } : item;
			});

			let merged = [...updatedPrev, ...updatedNew];

			const activeList = merged.filter((item) => !item.deleting);
			const deletingList = merged.filter((item) => item.deleting);

			const restoredList = activeList.map((item, index) => ({
				...item,
				sortKey: (index + 1) * 100,
			}));

			merged = [...restoredList, ...deletingList];

			setPrevThumbnailList(merged.filter((item) => item.type === "prev") as PrevImageItem[]);
			setNewThumbnailFiles(merged.filter((item) => item.type === "new") as ImageItem[]);
		} else {
			const updatedPrev = prevDetailList.map((item) => {
				const itemKey = getItemKey(item);
				return itemKey === targetKey ? { ...item, deleting: false } : item;
			});

			const updatedNew = newDetailFiles.map((item) => {
				const itemKey = getItemKey(item);
				return itemKey === targetKey ? { ...item, deleting: false } : item;
			});

			let merged = [...updatedPrev, ...updatedNew];

			const activeList = merged.filter((item) => !item.deleting);
			const deletingList = merged.filter((item) => item.deleting);

			const restoredList = activeList.map((item, index) => ({
				...item,
				sortKey: (index + 1) * 100,
			}));

			merged = [...restoredList, ...deletingList];

			setPrevDetailList(merged.filter((item) => item.type === "prev") as PrevImageItem[]);
			setNewDetailFiles(merged.filter((item) => item.type === "new") as ImageItem[]);
		}
		if (fileId) setDeleteImageIds((prev) => prev.filter((id) => id !== fileId));
	};

	// 저장하기
	useImperativeHandle(ref, () => ({
		getSubmitData() {
			if (thumbnailList.length === 0) {
				openDialog("ALERT", {
					content: "썸네일 이미지는 최소 1장 이상이어야 합니다.",
				});
				return;
			}
			if (detailImageList.length === 0) {
				openDialog("ALERT", {
					content: "상세 이미지는 최소 1장 이상이어야 합니다.",
				});
				return;
			}
			return {
				addFiles: [
					...newThumbnailFiles
						.filter((item) => !item.deleting)
						.map((item) => ({
							file: item.file,
							sortKey: item.sortKey,
							isThumbnail: true,
						})),
					...newDetailFiles
						.filter((item) => !item.deleting)
						.map((item) => ({
							file: item.file,
							sortKey: item.sortKey,
							isThumbnail: false,
						})),
				],
				updateFiles: [
					...prevThumbnailList
						.filter((item) => !item.deleting)
						.map((item) => ({
							productImageId: item.fileId,
							sortKey: item.sortKey,
						})),
					...prevDetailList
						.filter((item) => !item.deleting)
						.map((item) => ({
							productImageId: item.fileId,
							sortKey: item.sortKey,
						})),
				],
				deleteImageIds,
			};
		},
	}));

	// ------------------------------------------------
	// useEffect, useMemo
	// ------------------------------------------------

	const { thumbnailList, deletingThumbnailList, detailImageList, deletingDetailList } = useMemo(() => {
		const thumbnailList = [...prevThumbnailList, ...newThumbnailFiles];
		const detailImageList = [...prevDetailList, ...newDetailFiles];

		thumbnailList.sort((a, b) => a.sortKey - b.sortKey);
		detailImageList.sort((a, b) => a.sortKey - b.sortKey);

		return {
			thumbnailList: thumbnailList.filter((item) => !item.deleting),
			deletingThumbnailList: thumbnailList.filter((item) => item.deleting),
			detailImageList: detailImageList.filter((item) => !item.deleting),
			deletingDetailList: detailImageList.filter((item) => item.deleting),
		};
	}, [prevThumbnailList, newThumbnailFiles, prevDetailList, newDetailFiles]);

	useEffect(() => {
		if (!prevImageList) return;
		console.log({ isThumbnailDragging });
	}, [prevImageList, isThumbnailDragging]);

	useEffect(() => {
		if (!prevImageList) return;
		console.log("초기 이미지 리스트 세팅");

		// 초기 데이터 세팅 및 초기화
		thumbnailDragCountRef.current = 0;
		detailDragCountRef.current = 0;
		setPrevThumbnailList(prevImageList.filter((image) => image.thumbnail).map((image) => ({ ...image, type: "prev", deleting: false })));
		setPrevDetailList(prevImageList.filter((image) => !image.thumbnail).map((image) => ({ ...image, type: "prev", deleting: false })));
		setNewThumbnailFiles([]);
		setNewDetailFiles([]);
		setDeleteImageIds([]);
	}, [prevImageList, imageUpdatedAt]);

	return (
		<div className={styles.productImageSetWrap}>
			<div>
				<h3>제품 썸네일 이미지</h3>
				<div
					className={clsx(styles.productImageArea, { [styles.fileEmpty]: thumbnailList.length === 0 })}
					onClick={() => thumbnailInputRef.current?.click()}
					onDragEnter={() => handleDragEnter("thumbnail")}
					onDragOver={handleDragOver}
					onDragLeave={() => handleDragLeave("thumbnail")}
					onDrop={(e) => handleDrop(e, "thumbnail")}
				>
					<div className={styles.productImageScroll}>
						<div
							className={clsx(styles.productImageGrid)}
							onDragOver={(e) => {
								if (!draggingItemKey) return;
								e.preventDefault();
							}}
						>
							{thumbnailList.map((item, index) => {
								let image;
								if (item.type === "prev") {
									image = (
										<SmartImage
											src={getUploadImageUrl(item.storeName)}
											alt={`${item.fileName}-${index}`}
											fill
											objectFit="contain"
										/>
									);
								} else {
									image = <SmartImage src={item.previewUrl} alt={`${item.file.name}-${index}`} fill objectFit="contain" />;
								}

								const itemKey = getItemKey(item);
								const isDraggingItem = draggingItemKey === itemKey;

								return (
									<div
										key={"thumbnailItem-" + index}
										className={clsx(styles.imageItem)}
										draggable
										onDragStart={(e) => handleImageDragStart(e, item, index, "thumbnail")}
										onDrag={handleImageDrag}
										onDragEnd={() => handleImageDragEnd("thumbnail")}
										onClick={(e) => e.stopPropagation()}
										onDragOver={(e) => handleItemDragOver(e, index, "thumbnail")}
									>
										{thumbnailInsertIndex === index && <div className={styles.insertLine} />}
										{image}
										{/* 정렬 숫자 표시 */}
										<div className={styles.imageIndex}>{index + 1}</div>
										{/* 삭제 버튼 */}
										{thumbnailList.length > 1 && (
											<button
												className={styles.imageDelete}
												onClick={(e) => {
													e.stopPropagation();
													let fileId: number | undefined = undefined;
													if (item.type === "prev") fileId = item.fileId;
													handleImageDelete(itemKey, "thumbnail", fileId);
												}}
											>
												-
											</button>
										)}
										{/* 사진 이동 중 */}
										{isDraggingItem && (
											<div className={styles.imageMove}>
												<FiMove />
											</div>
										)}
										{index === thumbnailList.length - 1 && thumbnailInsertIndex === thumbnailList.length && (
											<div className={styles.insertLineLast} />
										)}
									</div>
								);
							})}
							{deletingThumbnailList.map((item, index) => {
								let image;
								if (item.type === "prev") {
									image = (
										<SmartImage
											src={getUploadImageUrl(item.storeName)}
											alt={`${item.fileName}-${index}`}
											fill
											objectFit="contain"
										/>
									);
								} else {
									image = <SmartImage src={item.previewUrl} alt={`${item.file.name}-${index}`} fill objectFit="contain" />;
								}
								const itemKey = getItemKey(item);
								return (
									<div
										key={"deletingThumbnailItem-" + index}
										className={clsx(styles.imageItem)}
										onClick={(e) => e.stopPropagation()}
									>
										{image}
										{/* 삭제 중 */}
										<div className={styles.imageDeleting}>x</div>
										{/* 삭제중 - 다시 추가 버튼 */}
										<button
											className={styles.imageRestore}
											onClick={(e) => {
												e.stopPropagation();
												let fileId: number | undefined = undefined;
												if (item.type === "prev") fileId = item.fileId;
												handleImageRestore(itemKey, "thumbnail", fileId);
											}}
										>
											↺
										</button>
									</div>
								);
							})}
						</div>
						{dragPreview && (
							<div
								className={styles.dragPreview}
								style={{
									left: dragPreview.x - 50,
									top: dragPreview.y - 50,
								}}
							>
								<SmartImage src={dragPreview.src} alt="drag preview" fill objectFit="contain" />
							</div>
						)}
					</div>
					{isThumbnailDragging && (
						<>
							<div className={clsx(styles.draggingImage)}></div>
						</>
					)}
				</div>

				<div className={styles.fileButtonWrap}>
					<button onClick={() => thumbnailInputRef.current?.click()}>파일 선택</button>
				</div>
				<input
					ref={thumbnailInputRef}
					name="thumbnailImages"
					type="file"
					accept=".jpg,.jpeg,.png,.webp,.gif"
					multiple
					className="hidden"
					onChange={handleFileChange}
				/>
			</div>
			<div>
				<h3>제품 상세 이미지</h3>
				<div
					className={clsx(styles.productImageArea, { [styles.fileEmpty]: detailImageList.length === 0 })}
					onClick={() => detailInputRef.current?.click()}
					onDragEnter={() => handleDragEnter("detail")}
					onDragOver={handleDragOver}
					onDragLeave={() => handleDragLeave("detail")}
					onDrop={(e) => handleDrop(e, "detail")}
				>
					<div className={styles.productImageScroll}>
						<div
							className={clsx(styles.productImageGrid)}
							onDragOver={(e) => {
								if (!draggingItemKey) return;
								e.preventDefault();
							}}
						>
							{detailImageList.map((item, index) => {
								let image;
								if (item.type === "prev") {
									image = (
										<SmartImage
											src={getUploadImageUrl(item.storeName)}
											alt={`${item.fileName}-${index}`}
											fill
											objectFit="contain"
										/>
									);
								} else {
									image = <SmartImage src={item.previewUrl} alt={`${item.file.name}-${index}`} fill objectFit="contain" />;
								}

								const itemKey = getItemKey(item);
								const isDraggingItem = draggingItemKey === itemKey;

								return (
									<div
										key={"detailItem-" + index}
										className={clsx(styles.imageItem)}
										draggable
										onDragStart={(e) => handleImageDragStart(e, item, index, "detail")}
										onDrag={handleImageDrag}
										onDragEnd={() => handleImageDragEnd("detail")}
										onClick={(e) => e.stopPropagation()}
										onDragOver={(e) => handleItemDragOver(e, index, "detail")}
									>
										{detailInsertIndex === index && <div className={styles.insertLine} />}
										{image}
										{/* 정렬 숫자 표시 */}
										<div className={styles.imageIndex}>{index + 1}</div>
										{/* 삭제 버튼 */}
										{detailImageList.length > 1 && (
											<button
												className={styles.imageDelete}
												onClick={(e) => {
													e.stopPropagation();
													let fileId: number | undefined = undefined;
													if (item.type === "prev") fileId = item.fileId;
													handleImageDelete(getItemKey(item), "detail", fileId);
												}}
											>
												-
											</button>
										)}
										{/* 사진 이동 중 */}
										{isDraggingItem && (
											<div className={styles.imageMove}>
												<FiMove />
											</div>
										)}
										{index === detailImageList.length - 1 && detailInsertIndex === detailImageList.length && (
											<div className={styles.insertLineLast} />
										)}
									</div>
								);
							})}
							{deletingDetailList.map((item, index) => {
								let image;
								if (item.type === "prev") {
									image = (
										<SmartImage
											src={getUploadImageUrl(item.storeName)}
											alt={`${item.fileName}-${index}`}
											fill
											objectFit="contain"
										/>
									);
								} else {
									image = <SmartImage src={item.previewUrl} alt={`${item.file.name}-${index}`} fill objectFit="contain" />;
								}
								return (
									<div key={"deletingDetailItem-" + index} className={clsx(styles.imageItem)} onClick={(e) => e.stopPropagation()}>
										{image}
										{/* 삭제 중 */}
										<div className={styles.imageDeleting}>x</div>
										{/* 삭제중 - 다시 추가 버튼 */}
										<button
											className={styles.imageRestore}
											onClick={(e) => {
												e.stopPropagation();
												let fileId: number | undefined = undefined;
												if (item.type === "prev") fileId = item.fileId;
												handleImageRestore(getItemKey(item), "detail", fileId);
											}}
										>
											↺
										</button>
									</div>
								);
							})}
						</div>
						{dragPreview && (
							<div
								className={styles.dragPreview}
								style={{
									left: dragPreview.x - 50,
									top: dragPreview.y - 50,
								}}
							>
								<SmartImage src={dragPreview.src} alt="drag preview" fill objectFit="contain" />
							</div>
						)}
					</div>
					{isDetailDragging && (
						<>
							<div className={clsx(styles.draggingImage)}></div>
						</>
					)}
				</div>

				<div className={styles.fileButtonWrap}>
					<button onClick={() => detailInputRef.current?.click()}>파일 선택</button>
				</div>
				<input
					ref={detailInputRef}
					name="productDetailImages"
					type="file"
					accept=".jpg,.jpeg,.png,.webp,.gif"
					multiple
					className="hidden"
					onChange={handleFileChange}
				/>
			</div>
		</div>
	);
});
ProductImageSet.displayName = "ProductImageSet";
