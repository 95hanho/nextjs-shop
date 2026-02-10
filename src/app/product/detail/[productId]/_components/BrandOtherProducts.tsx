"use client";

import { ImageFill } from "@/components/common/ImageFill";
import { ImageSlide, ImageSlideHandle } from "@/components/product/ImageSlide";
import { money } from "@/lib/format";
import { Product } from "@/types/product";
import Link from "next/link";
import { useRef, useState } from "react";
import { FiHeart } from "react-icons/fi";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import styles from "../ProductDetail.module.scss";

// interface BrandOtherProductsProps {}

export default function BrandOtherProducts() {
	const slideHandleRef = useRef<ImageSlideHandle | null>(null);
	const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 2 });

	const purchasedTogetherProducts: Product[] = [
		{
			productId: 1,
			name: "Waist String Wide Pants VW5ML470_3color",
			colorName: "123",
			originPrice: 135000,
			finalPrice: 128000,
			createdAt: new Date().toString(),
			likeCount: 123,
			viewCount: 123,
			wishCount: 123,
		},
		{
			productId: 1,
			name: "Waist String Wide Pants VW5ML470_3color",
			colorName: "123",
			originPrice: 135000,
			finalPrice: 128000,
			createdAt: new Date().toString(),
			likeCount: 123,
			viewCount: 123,
			wishCount: 123,
		},
		{
			productId: 1,
			name: "Waist String Wide Pants VW5ML470_3color",
			colorName: "123",
			originPrice: 135000,
			finalPrice: 128000,
			createdAt: new Date().toString(),
			likeCount: 123,
			viewCount: 123,
			wishCount: 123,
		},
		{
			productId: 1,
			name: "Waist String Wide Pants VW5ML470_3color",
			colorName: "123",
			originPrice: 135000,
			finalPrice: 128000,
			createdAt: new Date().toString(),
			likeCount: 123,
			viewCount: 123,
			wishCount: 123,
		},
		{
			productId: 1,
			name: "Waist String Wide Pants VW5ML470_3color",
			colorName: "123",
			originPrice: 135000,
			finalPrice: 128000,
			createdAt: new Date().toString(),
			likeCount: 123,
			viewCount: 123,
			wishCount: 123,
		},
		{
			productId: 1,
			name: "Waist String Wide Pants VW5ML470_3color",
			colorName: "123",
			originPrice: 135000,
			finalPrice: 128000,
			createdAt: new Date().toString(),
			likeCount: 123,
			viewCount: 123,
			wishCount: 123,
		},
		{
			productId: 1,
			name: "Waist String Wide Pants VW5ML470_3color",
			colorName: "123",
			originPrice: 135000,
			finalPrice: 128000,
			createdAt: new Date().toString(),
			likeCount: 123,
			viewCount: 123,
			wishCount: 123,
		},
		{
			productId: 1,
			name: "Waist String Wide Pants VW5ML470_3color",
			colorName: "123",
			originPrice: 135000,
			finalPrice: 128000,
			createdAt: new Date().toString(),
			likeCount: 123,
			viewCount: 123,
			wishCount: 123,
		},
		{
			productId: 1,
			name: "Waist String Wide Pants VW5ML470_3color",
			colorName: "123",
			originPrice: 135000,
			finalPrice: 128000,
			createdAt: new Date().toString(),
			likeCount: 123,
			viewCount: 123,
			wishCount: 123,
		},
		{
			productId: 1,
			name: "Waist String Wide Pants VW5ML470_3color",
			colorName: "123",
			originPrice: 130000,
			finalPrice: 128000,
			createdAt: new Date().toString(),
			likeCount: 123,
			viewCount: 123,
			wishCount: 123,
		},
	];

	return (
		<div className={styles.brandOtherProducts}>
			<h3>판매자 다른 상품</h3>
			<div className={styles.imageSlide}>
				{/* 슬라이드 벨트 */}
				<ImageSlide
					slideItemKey="purchasedTogether"
					onPageChange={({ page, totalPages }) => {
						setPageInfo({ page, totalPages });
					}}
					items={purchasedTogetherProducts}
					renderItem={(item, index) => {
						/* 슬라이드 요소 */
						return (
							<div className={styles.sliderItem}>
								{/* 전체 링크 */}
								<Link href={`/product/detail/${item.productId}`}></Link>
								{/* 이미지 */}
								<div className={styles.imageBox}>
									{/* <ImageFill /> */}
									<button>
										{/* <FaHeart /> */}
										<FiHeart />
									</button>
								</div>
								<div className={styles.slideProductName}>
									<p>
										{index}-{item.name}
									</p>
								</div>
								<h5>
									<b>10%</b>
									<span>{money(item.finalPrice)}</span>
								</h5>
							</div>
						);
					}}
				/>
				<div className={styles.sliderPagination}>
					<button onClick={() => slideHandleRef.current?.slidePrev()}>
						<RiArrowLeftSLine />
					</button>{" "}
					<strong>{pageInfo.page}</strong> / {pageInfo.totalPages}{" "}
					<button onClick={() => slideHandleRef.current?.slideNext()}>
						<RiArrowRightSLine />
					</button>
				</div>
			</div>
		</div>
	);
}
