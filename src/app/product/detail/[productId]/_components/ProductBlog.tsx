import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import styles from "../ProductDetail.module.scss";
import { GetProductDetailImageResponse, ProductImage } from "@/types/product";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SmartImage } from "@/components/ui/SmartImage";
import { getUploadImageUrl } from "@/lib/image";
import clsx from "clsx";

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
	// React
	// =================================================================

	// 상품설명 더보기
	const [openProductBlog, setOpenProductBlog] = useState(false);

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

			<div className={clsx(styles.productBlogWrap, { [styles.open]: openProductBlog })}>
				{productDetailImageList.map((item, index) => (
					<div key={`${item.fileId}-${index}`} className={styles.productBlogImagesWrap}>
						<div className={styles.productBlogImages}>
							<SmartImage
								src={getUploadImageUrl(item.storeName)}
								alt={`${item.fileName}-${index}`}
								width={800}
								height={600}
								style={{ width: "100%", height: "auto" }}
							/>
						</div>
					</div>
				))}
			</div>

			<button className={styles.descriptionMoreBtn} onClick={() => setOpenProductBlog(!openProductBlog)}>
				<div>
					<span>상품 설명 {openProductBlog ? "닫기" : "더보기"}</span>
					<span className={styles.moreIcon}>{openProductBlog ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
				</div>
			</button>
		</article>
	);
}
