"use client";

import { ImageFill } from "@/components/common/ImageFill";
import { ImageSlide, ImageSlideHandle } from "@/components/product/ImageSlide";
import { money } from "@/lib/format";
import { Product } from "@/types/product";
import Link from "next/link";
import { useRef, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import styles from "../ProductDetail.module.scss";

export default function BestRankProducts() {
	const slideHandleRef = useRef<ImageSlideHandle | null>(null);
	const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 2 });

	const bestRankProducts: Product[] = [
		{
			productId: 1,
			name: "W CLASSIC LOGO TEE (7color)",
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
			name: "W CLASSIC LOGO TEE (7color)",
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
			name: "W CLASSIC LOGO TEE (7color)",
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
			name: "W CLASSIC LOGO TEE (7color)",
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
			name: "W CLASSIC LOGO TEE (7color)",
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
			name: "W CLASSIC LOGO TEE (7color)",
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
			name: "W CLASSIC LOGO TEE (7color)",
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
			name: "W CLASSIC LOGO TEE (7color)",
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
			name: "W CLASSIC LOGO TEE (7color)",
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
			name: "W CLASSIC LOGO TEE (7color)",
			colorName: "123",
			originPrice: 135000,
			finalPrice: 128000,
			createdAt: new Date().toString(),
			likeCount: 123,
			viewCount: 123,
			wishCount: 123,
		},
	];

	return (
		<>
			<ImageSlide
				slideItemKey="bestRank"
				onPageChange={({ page, totalPages }) => {
					setPageInfo({ page, totalPages });
				}}
				items={bestRankProducts}
				renderItem={(item, index) => {
					/* 슬라이드 요소 */
					return (
						<div className={styles.sliderItem}>
							{/* 전체 링크 */}
							<Link href={`/product/detail/${item.productId}`}></Link>
							<div className={styles.imageBox}>
								{/* <ImageFill /> */}
								<mark>{index + 1}</mark>
								<button>
									{/* <FaHeart /> */}
									<FaHeart />
								</button>
							</div>
							<div className={styles.slideProductName}>
								<h6>마리떼 프랑소와 저버</h6>
								<p>
									{index}-{item.name}
								</p>
							</div>
							<h5>
								<b>15%</b>
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
		</>
	);
}
