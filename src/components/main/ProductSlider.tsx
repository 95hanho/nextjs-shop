import { MainProduct } from "@/types/main";
import { useRef, useState } from "react";
import styles from "./ProductSlider.module.scss";
import clsx from "clsx";

export const ProductSlider = ({ productList, right }: { productList: MainProduct[]; right?: boolean }) => {
	const [isPaused, setIsPaused] = useState(false);
	const marqueeRef = useRef<HTMLDivElement>(null);

	// 드래그 관련 상태
	const isDragging = useRef(false);
	const startX = useRef(0);
	const scrollLeft = useRef(0);

	const handleMouseDown = (e: React.MouseEvent) => {
		isDragging.current = true;
		startX.current = e.pageX - (marqueeRef.current?.offsetLeft ?? 0);
		scrollLeft.current = marqueeRef.current?.scrollLeft ?? 0;
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDragging.current || !marqueeRef.current) return;
		const x = e.pageX - marqueeRef.current.offsetLeft;
		const walk = (x - startX.current) * 1; // 스크롤 민감도
		marqueeRef.current.scrollLeft = scrollLeft.current - walk;
	};

	const handleMouseUp = () => {
		isDragging.current = false;
	};

	const handleMouseLeave = () => {
		isDragging.current = false;
	};

	const togglePlay = () => {
		setIsPaused((prev) => !prev);
	};

	return (
		<div className={styles.productSlider}>
			<div
				className={clsx(styles.marqueeContainer, isPaused && styles.paused, "mx-auto")}
				ref={marqueeRef}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseLeave}
				onTouchStart={(e) => handleMouseDown(e as any)}
				onTouchMove={(e) => handleMouseMove(e as any)}
				onTouchEnd={handleMouseUp}
			>
				<div className={clsx(styles.marqueeTrack, right && styles.right)}>
					{[...productList, ...productList].map((product, idx) => (
						<div className={styles.productItem} key={idx}>
							<img src={product.imgPath} alt={`Product ${product.productId}`} />
							<a href={product.copyrightUrl} target="_blank" className={styles.copyright}>
								{product.copyright}
							</a>
						</div>
					))}
				</div>
			</div>

			<button className={styles.marqueeToggleBtn} onClick={togglePlay}>
				{isPaused ? "▶️ 재생" : "⏸️ 멈춤"}
			</button>
		</div>
	);
};
