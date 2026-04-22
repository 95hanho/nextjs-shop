"use client";

import { SmartImage } from "@/components/ui/SmartImage";
import { ImageSlide } from "@/components/product/ImageSlide";
import { discountPercent, money } from "@/lib/format";
import { GetCategoryBestProductsResponse, OtherProduct } from "@/types/product";
import Link from "next/link";
import { useRef, useState } from "react";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import styles from "../ProductDetail.module.scss";
import { ImageSlideHandle } from "@/components/product/ImageSlide.type";
import { useParams } from "next/navigation";
import { WishButton } from "@/components/product/WishButton";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getNormal } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { getUploadImageUrl } from "@/lib/image";

export default function BestRankProducts() {
	// 1) [store / custom hooks] -------------------------------------------
	const { loginOn } = useAuth();
	const params = useParams<{
		productId: string;
	}>();
	const productIdNum = Number(params.productId);

	// 2) [useState / useRef] ----------------------------------------------
	const slideHandleRef = useRef<ImageSlideHandle | null>(null);
	const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 2 });

	// 3) [useQuery / useMutation] -----------------------------------------
	// 같은 카테고리 BEST 제품 조회
	const { data: categoryBestProductList = [] } = useQuery<GetCategoryBestProductsResponse, Error, OtherProduct[]>({
		queryKey: ["categoryBestProducts", productIdNum],
		queryFn: async () =>
			getNormal(getApiUrl(API_URL.PRODUCT_CATEGORY_BEST), {
				productId: productIdNum,
			}),
		enabled: !!productIdNum,
		select: (data) => data.categoryBestProductList,
	});

	return (
		<>
			<ImageSlide
				mode="slide"
				slidesPerView={5}
				getItemKey={(item, index) => `bestRank-${item.productId}-${index}`}
				onPageChange={({ page, totalPages }) => {
					setPageInfo({ page, totalPages });
				}}
				items={categoryBestProductList}
				onReady={(handle) => (slideHandleRef.current = handle)}
				renderItem={(item, index) => {
					/* 슬라이드 요소 */
					return (
						<div className={styles.sliderItem}>
							{/* 전체 링크 */}
							<Link href={`/product/detail/${item.productId}`}></Link>
							<div className={styles.imageBox}>
								<SmartImage fill src={getUploadImageUrl(item.filePath)} alt={item.fileName} />
								<mark>{index + 1}</mark>
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
								<h6>{item.sellerName}</h6>
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
		</>
	);
}
