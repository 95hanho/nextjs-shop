import { FormPageShell } from "@/components/form/FormPageShell";
import styles from "./ProductSet.module.scss";
import { ProductImage } from "@/types/seller";
import { SmartImage } from "@/components/ui/SmartImage";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { BsNutFill } from "react-icons/bs";

type PrevImageItem = ProductImage & {
	type: "prev";
};
type ImageItem = {
	type: "new";
	file: File;
	previewUrl: string;
	sortKey: number;
};

interface ProductImageSetProps {
	prevImageList?: ProductImage[];
}

export const ProductImageSet = ({ prevImageList }: ProductImageSetProps) => {
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

	// 드래그 앤 드롭 상태
	const [isThumbnailDragging, setIsThumbnailDragging] = useState(false);
	const [isDetailDragging, setIsDetailDragging] = useState(false);

	const allowedExtensions = ["jpg", "jpeg", "png", "webp", "gif"];

	const validateImageFiles = (files: File[]) => {
		return files.filter((file) => {
			const mimeOk = file.type.startsWith("image/");
			const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
			const extOk = allowedExtensions.includes(ext);
			return mimeOk && extOk;
		});
	};

	const addFiles = (files: File[], type: "thumbnail" | "detail") => {
		const validFiles = validateImageFiles(files);

		if (validFiles.length !== files.length) {
			alert("이미지 파일만 업로드할 수 있습니다.");
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
					sortKey: lastSortKey + (index + 1) * 100,
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
					sortKey: lastSortKey + (index + 1) * 100,
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
		if (type === "thumbnail") {
			thumbnailDragCountRef.current += 1;
			setIsThumbnailDragging(true);
		} else {
			detailDragCountRef.current += 1;
			setIsDetailDragging(true);
		}
	};
	const handleDragLeave = (type: "thumbnail" | "detail") => {
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
	// ------------------------------------------------
	// useEffect, useMemo
	// ------------------------------------------------

	const { thumbnailList, detailImageList } = useMemo(() => {
		const thumbnailList = [...prevThumbnailList, ...newThumbnailFiles];
		const detailImageList = [...prevDetailList, ...newDetailFiles];

		thumbnailList.sort((a, b) => a.sortKey - b.sortKey);
		detailImageList.sort((a, b) => a.sortKey - b.sortKey);

		return {
			thumbnailList,
			detailImageList,
		};
	}, [prevThumbnailList, newThumbnailFiles, prevDetailList, newDetailFiles]);

	useEffect(() => {
		if (!prevImageList) return;
		console.log({ isThumbnailDragging });
	}, [prevImageList, isThumbnailDragging]);

	useEffect(() => {
		if (!prevImageList) return;

		setPrevThumbnailList(prevImageList.filter((image) => image.thumbnail).map((image) => ({ ...image, type: "prev" })));
		setPrevDetailList(prevImageList.filter((image) => !image.thumbnail).map((image) => ({ ...image, type: "prev" })));
	}, [prevImageList]);

	return (
		<div className={styles.productImageSetWrap}>
			<div>
				<h3>제품 썸네일 이미지</h3>
				<div
					className={styles.productImageArea}
					onClick={() => thumbnailInputRef.current?.click()}
					onDragEnter={() => handleDragEnter("thumbnail")}
					onDragOver={handleDragOver}
					onDragLeave={() => handleDragLeave("thumbnail")}
					onDrop={(e) => handleDrop(e, "thumbnail")}
				>
					<div className={styles.productImageScroll}>
						<div className={clsx(styles.productImageGrid)}>
							{thumbnailList.map((item, index) => {
								let image;
								if (item.type === "prev") {
									image = <SmartImage src={item.filePath} alt={`${item.fileName}-${index}`} fill objectFit="contain" />;
								} else {
									image = <SmartImage src={item.previewUrl} alt={`${item.file.name}-${index}`} fill objectFit="contain" />;
								}
								return (
									<div key={"thumbnailItem-" + index} className={styles.imageItem}>
										{image}
										{/* 정렬 숫자 표시 */}
										<div className={styles.imageIndex}>{index + 1}</div>
									</div>
								);
							})}
						</div>
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
				{/* <div
					className={clsx(styles.productImageGrid)}
					onClick={() => {
						detailInputRef.current?.click();
					}}
					onDragEnter={() => handleDragEnter("detail")}
					onDragOver={handleDragOver}
					onDragLeave={() => handleDragLeave("detail")}
					onDrop={(e) => handleDrop(e, "detail")}
				>
					{detailImageList.map((item, index) => {
						let image;
						if (item.type === "prev") {
							image = <SmartImage src={item.filePath} alt={`${item.fileName}-${index}`} fill objectFit="contain" />;
						} else {
							image = <SmartImage src={item.previewUrl} alt={`${item.file.name}-${index}`} fill objectFit="contain" />;
						}
						return (
							<div key={"detailItem-" + index} className={styles.imageItem}>
								{image}
								<div className={styles.imageIndex}>{index + 1}</div>
							</div>
						);
					})}
					{isDetailDragging && <div className={clsx(styles.draggingImage)}></div>}
				</div> */}
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
};
