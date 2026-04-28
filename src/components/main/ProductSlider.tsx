"use client";

import { MainProduct } from "@/types/main";
import { ImageSlide } from "@/components/product/ImageSlide";
import styles from "./ProductSlider.module.scss";
import clsx from "clsx";
import { SmartImage } from "@/components/ui/SmartImage";
import { getUploadImageUrl } from "@/lib/image";
import { useRef } from "react";
import type { Swiper as SwiperType } from "swiper";
import { WishButton } from "@/components/product/WishButton";
import { useAuth } from "@/hooks/useAuth";

export const ProductSlider = ({ productList, right }: { productList: MainProduct[]; right?: boolean }) => {
	// 1) [store / custom hooks] -------------------------------------------
	const { loginOn } = useAuth();

	// 2) [useState / useRef] ----------------------------------------------
	const swiperRef = useRef<SwiperType | null>(null);
	const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// 5) [handlers / useCallback] -----------------------------------------
	const stopSlider = () => {
		if (resumeTimerRef.current) {
			clearTimeout(resumeTimerRef.current);
			resumeTimerRef.current = null;
		}
		swiperRef.current?.autoplay?.pause();
	};
	const resumeSlider = () => {
		if (resumeTimerRef.current) {
			clearTimeout(resumeTimerRef.current);
		}
		resumeTimerRef.current = setTimeout(() => {
			swiperRef.current?.autoplay?.resume();
		}, 2000);
	};

	return (
		<div className={styles.productSlider} onMouseEnter={stopSlider} onMouseLeave={resumeSlider}>
			<ImageSlide
				className={clsx(styles.productSwiper, right && styles.right)}
				items={productList}
				loop
				slidesPerView="auto"
				spaceBetween={0}
				speed={6000}
				autoplay={{
					delay: 0,
					disableOnInteraction: false,
					reverseDirection: right,
				}}
				onReady={(handle) => {
					swiperRef.current = handle.getSwiper();
				}}
				getItemKey={(product) => product.productId}
				renderItem={(product) => (
					<div className={styles.productItem}>
						<SmartImage src={getUploadImageUrl(product.filePath)} alt={product.fileName} width={200} height={200} />
						{(!!product.wishId || loginOn) && (
							<WishButton initWishOn={!!product.wishId} productId={product.productId} bottom={4} right={4} size={20} />
						)}
					</div>
				)}
			/>
		</div>
	);
};
