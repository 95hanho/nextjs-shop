"use client";

import { SmartImage } from "@/components/ui/SmartImage";
import { ImageSlide } from "@/components/product/ImageSlide";
import { discountPercent, money } from "@/lib/format";
import { OtherProduct } from "@/types/product";
import Link from "next/link";
import { useRef, useState } from "react";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import styles from "../ProductDetail.module.scss";
import { ImageSlideHandle } from "@/components/product/ImageSlide.type";
import { useAuth } from "@/hooks/useAuth";
import { WishButton } from "@/components/product/WishButton";
import { getUploadImageUrl } from "@/lib/image";

export default function BrandOtherProducts({ sellerOtherProducts }: { sellerOtherProducts: OtherProduct[] }) {
	// 1) [store / custom hooks] -------------------------------------------
	const { loginOn } = useAuth();

	// 2) [useState / useRef] ----------------------------------------------
	const slideHandleRef = useRef<ImageSlideHandle | null>(null);
	const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 2 });

	return (
		<div className={styles.brandOtherProducts}>
			<h3>판매자 다른 상품</h3>
			<div className={styles.otherProductImageSlide}>
				{/* 슬라이드 벨트 */}
				<ImageSlide
					mode="slide"
					slidesPerView={5}
					getItemKey={(item, index) => `purchasedTogether-${item.productId}-${index}`}
					onPageChange={({ page, totalPages }) => {
						setPageInfo({ page, totalPages });
					}}
					items={sellerOtherProducts}
					onReady={(handle) => (slideHandleRef.current = handle)}
					renderItem={(item) => {
						/* 슬라이드 요소 */
						return (
							<div key={`sellerOtherProduct-${item.productId}`} className={styles.sliderItem}>
								{/* 전체 링크 */}
								<Link href={`/product/detail/${item.productId}`}></Link>
								{/* 이미지 */}
								<div className={styles.imageBox}>
									<SmartImage fill src={getUploadImageUrl(item.filePath)} alt={item.fileName} />
									{loginOn && (
										<div className={styles.wishButton}>
											<WishButton
												key={"sellerOtherProductwishButton-" + item.productId}
												initWishOn={item.wished}
												productId={item.productId}
											/>
										</div>
									)}
								</div>
								<div className={styles.slideProductName}>
									<p>{item.name}</p>
								</div>
								<h5>
									{discountPercent(item.originPrice, item.finalPrice) > 0 && (
										<b>{discountPercent(item.originPrice, item.finalPrice)}%</b>
									)}
									<span>{money(item.finalPrice)}</span>
								</h5>
							</div>
						);
					}}
				/>
				<div className={styles.sliderPagination}>
					<button onClick={() => slideHandleRef.current?.slidePrevByGroup()}>
						<RiArrowLeftSLine />
					</button>{" "}
					<strong>{pageInfo.page}</strong> / {pageInfo.totalPages}{" "}
					<button onClick={() => slideHandleRef.current?.slideNextByGroup()}>
						<RiArrowRightSLine />
					</button>
				</div>
			</div>
		</div>
	);
}
