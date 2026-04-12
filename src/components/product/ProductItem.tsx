import styles from "./ProductItem.module.scss";
import { WishButton } from "@/components/product/WishButton";
import { SmartImage } from "@/components/ui/SmartImage";
import { FaEye, FaStar } from "react-icons/fa";
import { discountPercent, money } from "@/lib/format";
import Link from "next/link";
import { ImageSlide } from "@/components/product/ImageSlide";
import { FileInfo } from "@/types/file";

interface ProductItemProps {
	product: {
		id: number;
		productId: number;
		productImageList: FileInfo[];
		sellerName: string;
		productName: string;
		originPrice: number;
		finalPrice: number;
		viewCount: number;
		wishCount: number;
	};
	wishProductIds: number[];
}

export const ProductItem = ({ product, wishProductIds }: ProductItemProps) => {
	return (
		<div className={styles.productItem}>
			<Link href={`/product/detail/${product.productId}`} className={styles.productThumb}>
				<ImageSlide
					mode="fade"
					getItemKey={(item, index) => `product-${product.productId}-image-${index}`}
					items={product.productImageList}
					renderItem={(item) => (
						<div className={styles.imageBox}>
							<SmartImage src={item.filePath} fill objectFit={"cover"} className={styles.productImg} />
						</div>
					)}
					pagination
				/>
				{wishProductIds.length > 0 && (
					<WishButton
						productId={product.productId}
						initWishOn={wishProductIds.includes(product.productId)}
						right={6}
						bottom={6}
						clickHandler={() => {}}
					/>
				)}
			</Link>

			{/* 하단 상품설명 */}
			<Link href={`/product/detail/${product.productId}`} className={styles.productInfo}>
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
							<FaEye />
						</span>
						<span className={styles.metaCount}>{product.viewCount}</span>
					</div>

					<div className={styles.metaRate}>
						<span className={styles.metaIcon}>
							<FaStar />
						</span>
						<span className={styles.metaCount}>{product.wishCount}</span>
					</div>
				</div>
			</Link>
		</div>
	);
};
