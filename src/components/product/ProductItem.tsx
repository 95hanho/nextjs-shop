import styles from "./ProductItem.module.scss";
import { WishButton } from "@/components/product/WishButton";
import { SmartImage } from "@/components/ui/SmartImage";
import { FaHeart, FaStar } from "react-icons/fa";
import { discountPercent, money } from "@/lib/format";
import Link from "next/link";

interface ProductItemProps {
	product: {
		id: number;
		productId: number;
		filePath: string;
		sellerName: string;
		productName: string;
		originPrice: number;
		finalPrice: number;
		likeCount: number;
		wishCount: number;
	};
}

export const ProductItem = ({ product }: ProductItemProps) => {
	return (
		<Link href={`/product/detail/${product.productId}`} className={styles.productItem}>
			{/* 이미지 */}
			<div className={styles.productThumb}>
				<SmartImage src={product.filePath} fill={true} className={styles.productImg} />

				{/* WishButton 내부에서 className을 못 받는 구조면 유지, 받을 수 있으면 아래 주석처럼 */}
				<WishButton productId={product.productId} initWishOn={true} right={6} bottom={6} />
			</div>

			{/* 하단 상품설명 */}
			<div className={styles.productInfo}>
				<h4 className={styles.productBrand}>{product.sellerName}</h4>
				<h5 className={styles.productName}>{product.productName}</h5>

				<div className={styles.productPrice}>
					<div aria-live="polite">
						{product.originPrice !== product.finalPrice && (
							<span className={`${styles.summaryBadge} mr-1 text-red-500`}>
								{discountPercent(product.originPrice, product.finalPrice)}%
							</span>
						)}
						<span className={styles.summaryPrice}>{money(product.finalPrice)}</span>
					</div>
				</div>

				<div className={styles.productMeta}>
					<div className={styles.metaWish}>
						<span className={styles.metaIcon}>
							<FaHeart />
						</span>
						<span className={styles.metaCount}>{product.likeCount}</span>
					</div>

					<div className={styles.metaRate}>
						<span className={styles.metaIcon}>
							<FaStar />
						</span>
						<span className={styles.metaCount}>{product.wishCount}</span>
					</div>
				</div>
			</div>
		</Link>
	);
};
