import styles from "./ProductItem.module.scss";
import { WishButton } from "@/components/product/WishButton";
import { SmartImage } from "@/components/ui/SmartImage";
import { FaEye, FaStar } from "react-icons/fa";
import { discountPercent, money } from "@/lib/format";
import Link from "next/link";
import { ImageSlide } from "@/components/product/ImageSlide";
import { FileInfo } from "@/types/file";
import { getUploadImageUrl } from "@/lib/image";

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
		saleStop?: boolean;
		soldOut?: boolean;
	};
	wishProductIds: number[];
}
export const ProductItem = ({ product, wishProductIds }: ProductItemProps) => {
	// 상품 썸네일 영역 콘텐츠
	const productThumbContent = (
		<>
			{product.productImageList.length > 0 ? (
				<ImageSlide
					mode="fade"
					getItemKey={(item, index) => `product-${product.productId}-image-${index}`}
					items={product.productImageList}
					renderItem={(item) => (
						<div className={styles.imageBox}>
							<SmartImage
								src={getUploadImageUrl(item.filePath)}
								alt={item.fileName}
								fill
								objectFit={"cover"}
								className={styles.productImg}
							/>
						</div>
					)}
					pagination
				/>
			) : (
				<div className={styles.imageBox}>
					<SmartImage fill />
				</div>
			)}
			{wishProductIds.length > 0 && (
				<WishButton
					productId={product.productId}
					initWishOn={wishProductIds.includes(product.productId)}
					right={6}
					bottom={6}
					clickHandler={() => {}}
				/>
			)}
			{(product.saleStop || product.soldOut) && (
				<div className={styles.notSaleBadgeWrapper}>
					{product.saleStop && <div className={styles.saleStopBadge}>판매중지</div>}
					{!product.saleStop && product.soldOut && <div className={styles.soldOutBadge}>품절</div>}
				</div>
			)}
		</>
	);
	// 상품 하단 설명 콘텐츠
	const productInfoContent = (
		<>
			<h4 className={styles.productBrand}>{product.sellerName}</h4>
			<h5 className={styles.productName}>
				({product.productId}){product.productName}
			</h5>

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
		</>
	);

	return (
		<div className={styles.productItem}>
			{!product.saleStop ? (
				<Link
					href={`/product/detail/${product.productId}`}
					className={styles.productThumb}
					onClick={(e) => {
						if (product.saleStop) e.preventDefault();
					}}
				>
					{productThumbContent}
				</Link>
			) : (
				<div className={styles.productThumb}>{productThumbContent}</div>
			)}

			{/* 하단 상품설명 */}
			{!product.saleStop ? (
				<Link href={`/product/detail/${product.productId}`} className={styles.productInfo}>
					{productInfoContent}
				</Link>
			) : (
				<div className={styles.productInfo}>{productInfoContent}</div>
			)}
		</div>
	);
};
