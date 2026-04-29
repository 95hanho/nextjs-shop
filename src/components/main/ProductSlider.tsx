"use client";

import { MainProduct } from "@/types/main";
import { ImageSlide } from "@/components/product/ImageSlide";
import styles from "./ProductSlider.module.scss";
import clsx from "clsx";
import { useRef, useState } from "react";
import { ProductSliderItem } from "@/components/main/ProductSliderItem";

export const ProductSlider = ({ productList, right }: { productList: MainProduct[]; right?: boolean }) => {
	// 2) [useState / useRef] ----------------------------------------------
	const [paused, setPaused] = useState(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// 5) [handlers / useCallback] -----------------------------------------
	const stopSlider = () => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}

		setPaused(true);
	};

	const resumeSlider = () => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
		}

		timerRef.current = setTimeout(() => {
			setPaused(false);
		}, 2000);
	};

	return (
		<div className={styles.productSlider} onMouseEnter={stopSlider} onMouseLeave={resumeSlider}>
			<div className={clsx(styles.productSwiper, right && styles.right, paused && styles.paused)}>
				<ImageSlide
					className={clsx(styles.productSwiper, right && styles.right)}
					items={productList}
					loop
					slidesPerView="auto"
					spaceBetween={0}
					speed={700}
					autoplay={{
						delay: 2500,
						disableOnInteraction: false,
						pauseOnMouseEnter: true,
						reverseDirection: right,
					}}
					getItemKey={(product) => product.productId}
					renderItem={(product) => <ProductSliderItem product={product} />}
				/>
			</div>
		</div>
	);
};
