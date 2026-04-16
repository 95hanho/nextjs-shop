import type { Swiper as SwiperType } from "swiper";

export interface ImageSlideHandle {
	slidePrev: () => void;
	slideNext: () => void;
	slideToPage: (page: number) => void; // 1-based
	slidePrevByGroup: () => void;
	slideNextByGroup: () => void;
	getSwiper: () => SwiperType | null;
}
