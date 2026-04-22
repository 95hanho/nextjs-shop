import styles from "./ProductSet.module.scss";
import { AddFile, ProductImageItem, UpdateFile } from "@/types/seller";
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import { ImageDragInputArea } from "@/components/form/ImageDragInputArea";

type PrevImageItem = ProductImageItem & {
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
	prevImageList?: ProductImageItem[];
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
	// 1) [store / custom hooks] -------------------------------------------
	const { openDialog } = useGlobalDialogStore();

	// 2) [useState / useRef] ----------------------------------------------
	const [prevThumbnailList, setPrevThumbnailList] = useState<PrevImageItem[]>([]);
	const [prevDetailList, setPrevDetailList] = useState<PrevImageItem[]>([]);

	const [newThumbnailFiles, setNewThumbnailFiles] = useState<ImageItem[]>([]);
	const [newDetailFiles, setNewDetailFiles] = useState<ImageItem[]>([]);

	const [deleteImageIds, setDeleteImageIds] = useState<number[]>([]);

	// 5) [handlers / useCallback] -----------------------------------------
	// 저장하기
	useImperativeHandle(ref, () => ({
		getSubmitData() {
			if (prevThumbnailList.length === 0 && newThumbnailFiles.length === 0) {
				openDialog("ALERT", {
					content: "썸네일 이미지는 최소 1장 이상이어야 합니다.",
				});
				return;
			}
			if (prevDetailList.length === 0 && newDetailFiles.length === 0) {
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
							productImageId: item.productImageId,
							sortKey: item.sortKey,
						})),
					...prevDetailList
						.filter((item) => !item.deleting)
						.map((item) => ({
							productImageId: item.productImageId,
							sortKey: item.sortKey,
						})),
				],
				deleteImageIds,
			};
		},
	}));

	// 6) [useEffect] ------------------------------------------------------
	useEffect(() => {
		if (!prevImageList) return;
		// console.log({ prevImageList });
	}, [prevImageList]);
	useEffect(() => {
		if (!prevImageList) return;
		console.log("초기 이미지 리스트 세팅", { prevImageList: [...prevImageList] });

		// 초기 데이터 세팅 및 초기화
		setPrevThumbnailList(prevImageList.filter((image) => image.thumbnail).map((image) => ({ ...image, type: "prev", deleting: false })));
		setPrevDetailList(prevImageList.filter((image) => !image.thumbnail).map((image) => ({ ...image, type: "prev", deleting: false })));
		setNewThumbnailFiles([]);
		setNewDetailFiles([]);
		setDeleteImageIds([]);
	}, [prevImageList, imageUpdatedAt]);
	const { initThumbnailList, initDetailList } = useMemo(() => {
		return {
			initThumbnailList: prevImageList?.filter((image) => image.thumbnail).map((image) => ({ ...image, type: "prev", deleting: false })) || [],
			initDetailList: prevImageList?.filter((image) => !image.thumbnail).map((image) => ({ ...image, type: "prev", deleting: false })) || [],
		};
	}, [prevImageList]);

	return (
		<div className={styles.productImageSetWrap}>
			<ImageDragInputArea
				variant="thumbnail"
				title="제품 썸네일 이미지"
				initImageList={initThumbnailList}
				imageUpdatedAt={imageUpdatedAt}
				setDeleteImageIds={setDeleteImageIds}
				prevFileList={prevThumbnailList}
				changePrevFileList={(prev) => setPrevThumbnailList(prev)}
				newFileList={newThumbnailFiles}
				changeNewFileList={(newList) => setNewThumbnailFiles(newList)}
			/>
			<ImageDragInputArea
				variant="detail"
				title="제품 상세 이미지"
				initImageList={initDetailList}
				imageUpdatedAt={imageUpdatedAt}
				setDeleteImageIds={setDeleteImageIds}
				prevFileList={prevDetailList}
				changePrevFileList={(prev) => setPrevDetailList(prev)}
				newFileList={newDetailFiles}
				changeNewFileList={(newList) => setNewDetailFiles(newList)}
			/>
		</div>
	);
});
ProductImageSet.displayName = "ProductImageSet";
