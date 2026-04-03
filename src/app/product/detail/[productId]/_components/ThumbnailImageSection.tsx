import { SmartImage } from "@/components/ui/SmartImage";
import styles from "../ProductDetail.module.scss";
import { useState, type MouseEvent } from "react";
import { FileInfo } from "@/types/file";
import clsx from "clsx";

interface ThumbnailImageSectionProps {
	productImageList: (FileInfo & { productId: number })[];
}

export default function ThumbnailImageSection({ productImageList }: ThumbnailImageSectionProps) {
	// 현재 보여주는 사진
	const [currentImage, setCurrentImage] = useState(productImageList[0] ?? null);
	const [isHovering, setIsHovering] = useState(false); // 마우스 들어왔는지
	const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 }); // 렌즈의 left/top 위치

	const lensSize = 100;
	const zoomScale = 4.9; // 확대 배율
	const lensCenterX = lensPosition.x + lensSize / 2;
	const lensCenterY = lensPosition.y + lensSize / 2;
	const [areaRect, setAreaRect] = useState({ width: 1, height: 1 });
	const bgPosX = (lensCenterX / areaRect.width) * 100;
	const bgPosY = (lensCenterY / areaRect.height) * 100;

	/* ----- productImageArea 마우스 이벤트 핸들러 ----- */
	const handleMouseEnter = () => {
		setIsHovering(true);
	};
	const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		setAreaRect({ width: rect.width, height: rect.height });

		let x = e.clientX - rect.left - lensSize / 2;
		let y = e.clientY - rect.top - lensSize / 2;

		// 영역 밖으로 안 나가게 제한
		x = Math.max(0, Math.min(x, rect.width - lensSize));
		y = Math.max(0, Math.min(y, rect.height - lensSize));

		setLensPosition({ x, y });
	};
	const handleMouseLeave = () => {
		setIsHovering(false);
	};

	if (!currentImage) return null;
	return (
		<div className={styles.productImageSection}>
			<div className={styles.productImageArea} onMouseEnter={handleMouseEnter} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
				<SmartImage src={currentImage.filePath} width={900} height={900} objectFit="contain" />
				{/* 마우스 오버 시 확대할 곳 마우스 따라다니는 영역 */}
				<div
					className={styles.productImageEnlargeMouse}
					style={{
						display: isHovering ? "block" : "none",
						left: `${lensPosition.x}px`,
						top: `${lensPosition.y}px`,
					}}
				></div>
			</div>
			<div className={styles.productImageList}>
				{productImageList.map((image: FileInfo & { productId: number }) => (
					<div
						key={"productImageList-" + image.fileId}
						className={clsx(styles.productImageItem, currentImage.fileId === image.fileId && styles.active)}
						onMouseEnter={() => {
							setCurrentImage(image);
							setIsHovering(false);
							setLensPosition({ x: 0, y: 0 });
						}}
					>
						<SmartImage src={image.filePath} width={40} height={40} alt={image.fileName} />
					</div>
				))}
			</div>
			{/* 마우스 오버 시 확대 이미지 표시할 영역 */}
			{isHovering && (
				<div
					className={styles.productImageEnlargeView}
					style={{
						backgroundImage: `url(${currentImage.filePath})`,
						backgroundRepeat: "no-repeat",
						backgroundPosition: `${bgPosX}% ${bgPosY}%`,
						backgroundSize: `${zoomScale * 100}%`,
					}}
				></div>
			)}
		</div>
	);
}
