import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { ReactNode, useEffect, useRef, useState } from "react";

export interface ImageSlideHandle {
	slidePrev: () => void;
	slideNext: () => void;
	slideToPage: (page: number) => void; // 1-based
	getSwiper: () => SwiperType | null;
}

interface ImageSlideProps<T> {
	slideItemKey: string;
	slidesPerView?: number;
	spaceBetween?: number;
	/** 페이지네이션 연동이 필요하면 */
	onPageChange?: (info: { page: number; totalPages: number; swiper: SwiperType }) => void;
	/** 외부에서 prev/next 누르려고 ref로 받기 */
	onReady?: (handle: ImageSlideHandle) => void;
	items: T[];
	renderItem: (item: T, index: number) => ReactNode;
}

export const ImageSlide = <T,>({
	slidesPerView = 5,
	spaceBetween = 20,
	onPageChange,
	onReady,
	items,
	renderItem,
	slideItemKey,
}: ImageSlideProps<T>) => {
	const swiperRef = useRef<SwiperType | null>(null);

	// "3 / 4" 같은 페이지 단위는 Swiper의 snapGrid 기준이 가장 안정적
	const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 2 });

	const computePageInfo = (swiper: SwiperType) => {
		const totalPages = Math.max(1, swiper.snapGrid?.length ?? 1);
		const page = Math.min(totalPages, (swiper.snapIndex ?? 0) + 1);
		return { page, totalPages };
	};

	const syncPageInfo = (swiper: SwiperType) => {
		const next = computePageInfo(swiper);
		setPageInfo(next);
		onPageChange?.({ ...next, swiper });
	};

	useEffect(() => {
		if (!onReady) return;

		const handle: ImageSlideHandle = {
			slidePrev: () => swiperRef.current?.slidePrev(),
			slideNext: () => swiperRef.current?.slideNext(),
			slideToPage: (page: number) => {
				const swiper = swiperRef.current;
				if (!swiper) return;
				const total = Math.max(1, swiper.snapGrid?.length ?? 1);
				const clamped = Math.min(total, Math.max(1, page));
				// snapIndex 기준 page -> index
				swiper.slideTo(clamped - 1);
			},
			getSwiper: () => swiperRef.current,
		};

		onReady(handle);
	}, [onReady]);

	return (
		<Swiper
			slidesPerView={slidesPerView}
			spaceBetween={spaceBetween}
			onSwiper={(swiper: SwiperType) => (swiperRef.current = swiper)}
			onSlideChange={(swiper) => {
				syncPageInfo(swiper);
			}}
			onResize={(swiper) => {
				// 반응형/리사이즈로 snapGrid 변경될 수 있어서 동기화
				syncPageInfo(swiper);
			}}
		>
			{items.map((item, index) => (
				<SwiperSlide key={slideItemKey + index}>{renderItem(item, index)}</SwiperSlide>
			))}
		</Swiper>
	);
};
