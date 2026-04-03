import "swiper/css";
import { Swiper, SwiperProps, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { ReactNode, useEffect, useRef, useState } from "react";
import { EffectFade, Autoplay, EffectCards, Pagination } from "swiper/modules";
import { ImageSlideHandle } from "@/components/product/ImageSlide.type";
import "swiper/css/pagination";

type Mode = "slide" | "fade" | "cards";
interface ImageSlideProps<T> {
	mode?: Mode;
	getItemKey?: (item: T, index: number) => string | number;
	slidesPerView?: number;
	spaceBetween?: number;
	/** 페이지네이션 연동이 필요하면 */
	onPageChange?: (info: { page: number; totalPages: number; swiper: SwiperType }) => void;
	/** 외부에서 prev/next 누르려고 ref로 받기 */
	onReady?: (handle: ImageSlideHandle) => void;
	items: T[];
	renderItem: (item: T, index: number) => ReactNode;
	autoplay?: {
		delay: number;
	};
	loop?: boolean;
	pagination?: boolean;
}

export const ImageSlide = <T,>({
	mode = "slide",
	slidesPerView = 5,
	spaceBetween = 20,
	onPageChange,
	onReady,
	items,
	renderItem,
	getItemKey,
	autoplay,
	loop = false,
	pagination = false,
}: ImageSlideProps<T>) => {
	// =================================================================
	// React
	// =================================================================

	const swiperRef = useRef<SwiperType | null>(null);
	// "3 / 4" 같은 페이지 단위는 Swiper의 snapGrid 기준이 가장 안정적
	const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 2 });
	const modules: SwiperProps["modules"] = [];

	// 페이지네이션 계산 함수 (Swiper의 snapGrid 기준)
	const computePageInfo = (swiper: SwiperType) => {
		const totalPages = Math.max(1, swiper.snapGrid?.length ?? 1);
		const page = Math.min(totalPages, (swiper.snapIndex ?? 0) + 1);
		return { page, totalPages };
	};
	// 페이지네이션 동기화 함수 (슬라이드 변경 시)
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

	// =================================================================
	// UI
	// =================================================================

	// 슬라이드 모드별 기본 설정
	const commonSwiperProps: Partial<SwiperProps> = {
		onSwiper: (swiper: SwiperType) => {
			swiperRef.current = swiper;
			syncPageInfo(swiper);
		},
		onSlideChange: (swiper) => {
			syncPageInfo(swiper);
		},
		onResize: (swiper) => {
			// 반응형/리사이즈로 snapGrid 변경될 수 있어서 동기화
			syncPageInfo(swiper);
		},
	};
	let plusSwiperProps: Partial<SwiperProps> = {};

	if (loop) {
		commonSwiperProps.loop = true;
	}
	if (autoplay) {
		modules.push(Autoplay);
		commonSwiperProps.autoplay = autoplay;
	}
	if (pagination) {
		modules.push(Pagination);
		commonSwiperProps.pagination = { clickable: true };
	}

	// 여러 장이 나란히 슬라이드하는 모드
	if (mode === "slide") {
		plusSwiperProps = {
			spaceBetween,
			slidesPerView,
		};
	}
	// 한 장의 이미지씩 페이드 전환하는 모드
	if (mode === "fade") {
		modules.push(EffectFade);
		plusSwiperProps = {
			slidesPerView: 1,
			effect: "fade",
			fadeEffect: {
				crossFade: true,
			},
		};
	}
	// 살짝 겹쳐져서 카드처럼 보이는 모드 (Swiper의 'creative' 효과 활용)
	if (mode === "cards") {
		modules.push(EffectCards);
		plusSwiperProps = {
			effect: "cards",
			grabCursor: true,
		};
	}

	const swiperProps = {
		...commonSwiperProps,
		...plusSwiperProps,
		modules,
	};

	return (
		<Swiper {...swiperProps}>
			{items.map((item, index) => (
				<SwiperSlide key={getItemKey ? getItemKey(item, index) : index}>{renderItem(item, index)}</SwiperSlide>
			))}
		</Swiper>
	);
};
