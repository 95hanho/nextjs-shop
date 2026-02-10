import ProductSpecTable from "@/app/product/detail/[productId]/_components/ProductSpecTable";
import SellerInfoSection from "@/app/product/detail/[productId]/_components/SellerInfoSection";
import styles from "../ProductDetail.module.scss";

// 상품정보 보기, 판매자 정보
export default function ProductInfoSection() {
	return (
		<section className={styles.productInfoSection}>
			<ProductSpecTable />
			<SellerInfoSection />
		</section>
	);
}
