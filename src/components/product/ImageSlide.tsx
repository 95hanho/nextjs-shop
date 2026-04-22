import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperProps, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { ReactNode, useEffect, useRef, useState } from "react";
import { EffectFade, Autoplay, EffectCards, Pagination } from "swiper/modules";
import { ImageSlideHandle } from "@/components/product/ImageSlide.type";

type Mode = "slide" | "fade" | "cards";
interface ImageSlideProps<T> {
	className?: string;
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
	className,
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
	// 2) [useState / useRef] ----------------------------------------------
	const swiperRef = useRef<SwiperType | null>(null);
	// "3 / 4" 같은 페이지 단위는 Swiper의 snapGrid 기준이 가장 안정적
	const [, setPageInfo] = useState({ page: 1, totalPages: 2 });

	// 5) [handlers / useCallback] -----------------------------------------
	// 페이지네이션 계산 함수 (Swiper의 snapGrid 기준)
	const computePageInfo = (swiper: SwiperType) => {
		const totalPages = Math.max(1, Math.ceil(items.length / slidesPerView));
		const page = Math.min(totalPages, Math.floor((swiper.activeIndex ?? 0) / slidesPerView) + 1);

		return { page, totalPages };
	};
	// 페이지네이션 동기화 함수 (슬라이드 변경 시)
	const syncPageInfo = (swiper: SwiperType) => {
		const next = computePageInfo(swiper);
		setPageInfo(next);
		onPageChange?.({ ...next, swiper });
	};

	// 6) [useEffect] ------------------------------------------------------
	useEffect(() => {
		if (!onReady) return;

		const handle: ImageSlideHandle = {
			slidePrev: () => swiperRef.current?.slidePrev(),
			slideNext: () => swiperRef.current?.slideNext(),
			slideToPage: (page: number) => {
				const swiper = swiperRef.current;
				if (!swiper) return;

				const totalPages = Math.max(1, Math.ceil(items.length / slidesPerView));
				const clampedPage = Math.min(totalPages, Math.max(1, page));
				const targetIndex = (clampedPage - 1) * slidesPerView;
				swiper.slideTo(targetIndex);
			},
			slidePrevByGroup: () => {
				const swiper = swiperRef.current;
				if (!swiper) return;

				const step = slidesPerView;
				const nextIndex = Math.max(0, (swiper.activeIndex ?? 0) - step);
				swiper.slideTo(nextIndex);
			},
			slideNextByGroup: () => {
				const swiper = swiperRef.current;
				if (!swiper) return;

				const step = slidesPerView;
				const maxIndex = Math.max(0, items.length - slidesPerView);
				const nextIndex = Math.min(maxIndex, (swiper.activeIndex ?? 0) + step);
				swiper.slideTo(nextIndex);
			},
			getSwiper: () => swiperRef.current,
		};

		onReady(handle);
	}, [onReady, items.length, slidesPerView]);

	// 7) [UI helper values] -------------------------------------------------
	const modules: SwiperProps["modules"] = [];
	let plusSwiperProps: Partial<SwiperProps> = {};

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
		<Swiper {...swiperProps} className={className}>
			{items.map((item, index) => (
				<SwiperSlide key={getItemKey ? getItemKey(item, index) : index}>{renderItem(item, index)}</SwiperSlide>
			))}
		</Swiper>
	);
};
