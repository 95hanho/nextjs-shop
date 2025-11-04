"use client";

import { MainProduct } from "@/types/main";
import { useRef, useState } from "react";

export default function ProductSlider({ productList, right }: { productList: MainProduct[]; right?: boolean }) {
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
		<div className="product-slider">
			<div
				className={`marquee-container${isPaused ? " paused" : ""} mx-auto`}
				ref={marqueeRef}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseLeave}
				onTouchStart={(e) => handleMouseDown(e as any)}
				onTouchMove={(e) => handleMouseMove(e as any)}
				onTouchEnd={handleMouseUp}
			>
				<div className={`marquee-track ${right ? "right" : ""}`}>
					{[...productList, ...productList].map((product, idx) => (
						<div className="product-item" key={idx}>
							<img src={product.imgPath} alt={`Product ${product.productId}`} />
							<a href={product.copyrightUrl} target="_blank" className="copyright">
								{product.copyright}
							</a>
						</div>
					))}
				</div>
			</div>
			<button className="marquee-toggle-btn" onClick={togglePlay}>
				{isPaused ? "▶️ 재생" : "⏸️ 멈춤"}
			</button>
		</div>
	);
}
