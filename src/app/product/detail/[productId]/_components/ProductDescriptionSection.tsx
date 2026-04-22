import ProductBlog from "@/app/product/detail/[productId]/_components/ProductBlog";
import ProductDescription from "@/app/product/detail/[productId]/_components/ProductDescription";
import styles from "../ProductDetail.module.scss";

// 업체등록 상품 상세 블로그
export default function ProductDescriptionSection() {
	return (
		<section className={styles.productDescription}>
			<ProductDescription />
			{/* 광고이미지 */}
			<div className={styles.advertisementImage}>
				<img src="" alt="광고 이미지" />
			</div>
			{/* 등록된 상품정보이미지 */}
			<ProductBlog />
		</section>
	);
}
