import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import styles from "../ProductDetail.module.scss";
import { GetProductDetailImageResponse, ProductImage } from "@/types/product";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

// 등록된 상품정보이미지
export default function ProductBlog({ productId }: { productId: number }) {
	// =================================================================
	// React Query
	// =================================================================

	// 제품 상세보기 상세이미지(상품소개) 조회
	const { data: productDetailImageList = [] } = useQuery<GetProductDetailImageResponse, Error, ProductImage[]>({
		queryKey: ["productDetailImageList", productId],
		queryFn: () => getNormal<GetProductDetailImageResponse>(getApiUrl(API_URL.PRODUCT_DETAIL_IMAGE), { productId }),
		refetchOnWindowFocus: false,
		select: (data) => {
			return data.productDetailImageList;
		},
	});

	// =================================================================
	// useEffect, useMemo
	// =================================================================

	useEffect(() => {
		console.log(123);
		if (productDetailImageList.length > 0) {
			console.log({ productDetailImageList });
		}
	}, [productDetailImageList]);

	return (
		<article className={styles.productBlog}>
			<h2>상품 설명</h2>

			<div className={styles.productBlogWrap}>
				{[...Array(5)].map((_, i) => (
					<div key={i} className={styles.productBlogImagesWrap}>
						<div className={styles.productBlogImages}>
							<img src="https://ehfqntuqntu.cdn1.cafe24.com/main/4.jpg" alt="123" />
						</div>
					</div>
				))}
			</div>

			<button className={styles.descriptionMoreBtn}>
				<div>
					<span>상품 설명 {true ? "더보기" : "닫기"}</span>
					<span className={styles.moreIcon}>{true ? <IoIosArrowDown /> : <IoIosArrowUp />}</span>
				</div>
			</button>
		</article>
	);
}
