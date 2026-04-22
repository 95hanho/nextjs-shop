import clsx from "clsx";
import styles from "./ImageDragInputArea.module.scss";
import { SmartImage } from "@/components/ui/SmartImage";
import { FiMove } from "react-icons/fi";
import { getUploadImageUrl } from "@/lib/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import { FileInfo } from "@/types/file";

type PrevImageItem<T> = T &
	FileInfo & {
		sortKey: number;
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

interface ImageDragInputAreaProps<T> {
	variant: string;
	title: string;
	initImageList?: T[];
	imageUpdatedAt?: string;
	setDeleteImageIds?: React.Dispatch<React.SetStateAction<number[]>>;
	prevFileList?: PrevImageItem<T>[];
	changePrevFileList?: (prev: PrevImageItem<T>[]) => void;
	newFileList: ImageItem[];
	changeNewFileList: (newList: ImageItem[]) => void;
}

export const ImageDragInputArea = <T,>({
	variant,
	title,
	initImageList = [],
	imageUpdatedAt,
	setDeleteImageIds,
	prevFileList = [],
	changePrevFileList,
	newFileList,
	changeNewFileList,
}: ImageDragInputAreaProps<T>) => {
	const { openDialog } = useGlobalDialogStore();

	// ------------------------------------------------
	// React
	// ------------------------------------------------

	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const dragCountRef = useRef(0);

	// ------------------------------------------------
	const [draggingItemKey, setDraggingItemKey] = useState<string | null>(null);
	const [dragPreview, setDragPreview] = useState<{
		src: string;
		x: number;
		y: number;
	} | null>(null);

	//
	const [insertIndex, setInsertIndex] = useState<number | null>(null);
	const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

	// 드래그 앤 드롭 상태
	const [isDragging, setIsDragging] = useState(false);

	/** 파일 타입 체크 */
	const validateImageFiles = (files: File[]) => {
		return files.filter((file) => {
			const mimeOk = file.type.startsWith("image/");
			const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
			const allowedExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
			const extOk = allowedExtensions.includes(ext);
			return mimeOk && extOk;
		});
	};
	/** 파일 추가 */
	const addFiles = (files: File[]) => {
		const validFiles = validateImageFiles(files);

		if (validFiles.length !== files.length) {
			openDialog("ALERT", {
				content: "이미지 파일만 업로드할 수 있습니다.",
			});
			return;
		}

		const lastSortKey = fileList[fileList.length - 1]?.sortKey || 0;
		changeNewFileList([
			...newFileList,
			...validFiles.map<ImageItem>((file, index) => ({
				file,
				type: "new",
				previewUrl: URL.createObjectURL(file),
				uploadTime: new Date().getTime(),
				sortKey: lastSortKey + (index + 1) * 100,
				deleting: false,
			})),
		]);
	};
	/** 파일 변경 시 */
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		const fileArray = Array.from(files);

		addFiles(fileArray);
		e.target.value = "";
	};
	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};
	// 드래그 영역에 들어올 때마다 호출
	const handleDragEnter = () => {
		if (draggingItemKey) return; // 드래그 중인 이미지 있을 때는 무시

		dragCountRef.current += 1;
		setIsDragging(true);
	};
	// 드래그 영역에서 벗어날 때
	const handleDragLeave = () => {
		if (draggingItemKey) return; // 드래그 중인 이미지 있을 때는 무시

		dragCountRef.current -= 1;

		if (dragCountRef.current <= 0) {
			dragCountRef.current = 0;
			setIsDragging(false);
		}
	};
	// 드래그 영역 안에서 드래그 중
	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		if (draggingItemKey) return; // 드래그 중인 이미지 있을 때는 무시
		e.preventDefault();
		e.stopPropagation();

		const files = Array.from(e.dataTransfer.files || []);
		if (files.length === 0) {
			dragCountRef.current = 0;
			setIsDragging(false);

			return;
		}

		addFiles(files);

		dragCountRef.current = 0;
		setIsDragging(false);
	};
	// 이미지 고유 키 생성 함수
	const getItemKey = (item: PrevImageItem<T> | ImageItem) => {
		if (item.type === "prev") {
			return `prev-${item.fileId}`;
		}
		return `new-${item.file.name}-${item.uploadTime}`;
	};
	// 이미지 드래그 시작
	const handleImageDragStart = (e: React.DragEvent<HTMLDivElement>, item: PrevImageItem<T> | ImageItem, index: number) => {
		e.stopPropagation();

		const src = item.type === "prev" ? getUploadImageUrl(item.filePath) : item.previewUrl;
		const itemKey = getItemKey(item);

		setDraggingItemKey(itemKey);
		setDraggingIndex(index);

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
	// 이미지 드래그 중
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
	// 이미지 드래그 종료
	const handleImageDragEnd = () => {
		handleImageSortDrop();
		setDraggingIndex(null);
		setDraggingItemKey(null);
		setDragPreview(null);
		setInsertIndex(null);
	};
	// 삽입 위치 계산
	const handleItemDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
		if (!draggingItemKey) return;

		e.preventDefault();
		e.stopPropagation();

		const rect = e.currentTarget.getBoundingClientRect();
		const middleX = rect.left + rect.width / 2;

		if (e.clientX < middleX) {
			setInsertIndex(index);
		} else {
			setInsertIndex(index + 1);
		}
	};
	// 재정렬 함수
	const handleImageSortDrop = () => {
		if (draggingIndex === null || insertIndex === null) return;

		const reorderedList = [...fileList];
		const [movedItem] = reorderedList.splice(draggingIndex, 1);

		let nextInsertIndex = insertIndex;
		if (draggingIndex < insertIndex) {
			nextInsertIndex -= 1;
		}

		// 드래그한 아이템이 현재 위치에서 이동하려는 위치로 바로 옆으로 이동하는 경우는 무시
		if (draggingIndex === nextInsertIndex) return;
		if (draggingIndex + 1 === insertIndex) return;

		reorderedList.splice(nextInsertIndex, 0, movedItem);

		const updatedList = reorderedList.map((item, index) => ({
			...item,
			sortKey: (index + 1) * 100,
		}));

		changePrevFileList?.([
			...(updatedList.filter((item) => item.type === "prev") as PrevImageItem<T>[]),
			...(deletingFileList.filter((item) => item.type === "prev") as PrevImageItem<T>[]),
		]);
		changeNewFileList([
			...(updatedList.filter((item) => item.type === "new") as ImageItem[]),
			...(deletingFileList.filter((item) => item.type === "new") as ImageItem[]),
		]);
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
	// 이미지 삭제 클릭
	const handleImageDelete = (targetKey: string, fileId?: number) => {
		const updatedPrev = prevFileList.map((item) => {
			const itemKey = getItemKey(item);
			return itemKey === targetKey ? { ...item, deleting: true } : item;
		});

		const updatedNew = newFileList.map((item) => {
			const itemKey = getItemKey(item);
			return itemKey === targetKey ? { ...item, deleting: true } : item;
		});

		const merged = [...updatedPrev, ...updatedNew];
		const reordered = reassignSortKey(merged);

		changePrevFileList?.(reordered.filter((item) => item.type === "prev") as PrevImageItem<T>[]);
		changeNewFileList(reordered.filter((item) => item.type === "new") as ImageItem[]);

		if (fileId) setDeleteImageIds?.((prev) => [...prev, fileId]);
	};
	// 이미지 복원 클릭
	const handleImageRestore = (targetKey: string, fileId?: number) => {
		const updatedPrev = prevFileList.map((item) => {
			const itemKey = getItemKey(item);
			return itemKey === targetKey ? { ...item, deleting: false } : item;
		});

		const updatedNew = newFileList.map((item) => {
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

		changePrevFileList?.(merged.filter((item) => item.type === "prev") as PrevImageItem<T>[]);
		changeNewFileList(merged.filter((item) => item.type === "new") as ImageItem[]);

		if (fileId) setDeleteImageIds?.((prev) => prev.filter((id) => id !== fileId));
	};

	// ------------------------------------------------
	// useEffect, useMemo
	// ------------------------------------------------

	useEffect(() => {
		if (!initImageList || initImageList.length === 0) return;
		console.log(`초기 ${title} 세팅`, { initImageList });

		// 초기 데이터 세팅 및 초기화
		dragCountRef.current = 0;
	}, [initImageList, imageUpdatedAt, title]);

	const { fileList, deletingFileList } = useMemo(() => {
		const fileList = [...prevFileList, ...newFileList];

		fileList.sort((a, b) => a.sortKey - b.sortKey);

		return {
			fileList: fileList.filter((item) => !item.deleting),
			deletingFileList: fileList.filter((item) => item.deleting),
		};
	}, [prevFileList, newFileList]);
	useEffect(() => {
		if (fileList.length > 0) console.log({ fileList });
	}, [fileList]);

	return (
		<div className={styles.imageDragInputArea}>
			<h3 className={clsx(styles[`${variant}Title`])}>{title}</h3>
			<div
				className={clsx(styles.productImageArea, { [styles.fileEmpty]: fileList.length === 0 })}
				onClick={() => fileInputRef.current?.click()}
				onDragEnter={handleDragEnter}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={(e) => handleDrop(e)}
			>
				<div className={styles.productImageScroll}>
					<div
						className={clsx(styles.productImageGrid)}
						onDragOver={(e) => {
							if (!draggingItemKey) return;
							e.preventDefault();
						}}
					>
						{fileList.map((item, index) => {
							let image;
							if (item.type === "prev") {
								image = (
									<SmartImage src={getUploadImageUrl(item.filePath)} alt={`${item.fileName}-${index}`} fill objectFit="contain" />
								);
							} else {
								image = <SmartImage src={item.previewUrl} alt={`${item.file.name}-${index}`} fill objectFit="contain" />;
							}

							const itemKey = getItemKey(item);
							const isDraggingItem = draggingItemKey === itemKey;

							return (
								<div
									key={`${variant}Item-${index}`}
									className={clsx(styles.imageItem)}
									draggable
									onDragStart={(e) => handleImageDragStart(e, item, index)}
									onDrag={handleImageDrag}
									onDragEnd={() => handleImageDragEnd()}
									onClick={(e) => e.stopPropagation()}
									onDragOver={(e) => handleItemDragOver(e, index)}
								>
									{insertIndex === index && <div className={styles.insertLine} />}
									{image}
									{/* 정렬 숫자 표시 */}
									<div className={styles.imageIndex}>{index + 1}</div>
									{/* 삭제 버튼 */}
									{fileList.length > 1 && (
										<button
											className={styles.imageDelete}
											onClick={(e) => {
												e.stopPropagation();
												let fileId: number | undefined = undefined;
												if (item.type === "prev") fileId = item.fileId;
												handleImageDelete(itemKey, fileId);
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
									{index === fileList.length - 1 && insertIndex === fileList.length && <div className={styles.insertLineLast} />}
								</div>
							);
						})}
						{deletingFileList.map((item, index) => {
							let image;
							if (item.type === "prev") {
								image = (
									<SmartImage src={getUploadImageUrl(item.filePath)} alt={`${item.fileName}-${index}`} fill objectFit="contain" />
								);
							} else {
								image = <SmartImage src={item.previewUrl} alt={`${item.file.name}-${index}`} fill objectFit="contain" />;
							}
							const itemKey = getItemKey(item);
							return (
								<div key={`${variant}DeletingItem-${index}`} className={clsx(styles.imageItem)} onClick={(e) => e.stopPropagation()}>
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
											handleImageRestore(itemKey, fileId);
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
				{isDragging && (
					<>
						<div className={clsx(styles.draggingImage)}></div>
					</>
				)}
			</div>
			<div className={styles.fileButtonWrap}>
				<button onClick={() => fileInputRef.current?.click()}>파일 선택</button>
			</div>
			<input
				ref={fileInputRef}
				name={`${variant}Images`}
				type="file"
				accept=".jpg,.jpeg,.png,.webp,.gif"
				multiple
				className="hidden"
				onChange={handleFileChange}
			/>
		</div>
	);
};
