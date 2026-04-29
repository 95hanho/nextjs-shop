import { WishButton } from "@/components/product/WishButton";
import { SmartImage } from "@/components/ui/SmartImage";
import { getUploadImageUrl } from "@/lib/image";
import { MainProduct } from "@/types/main";
import styles from "./ProductSliderItem.module.scss";
import { FaChevronCircleRight, FaEye, FaStar } from "react-icons/fa";
import { discountPercent, money } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import clsx from "clsx";
import Link from "next/link";

export const ProductSliderItem = ({ product }: { product: MainProduct }) => {
	// 1) [store / custom hooks] -------------------------------------------
	const { loginOn } = useAuth();

	// 2) [useState / useRef] ----------------------------------------------
	// productInfo(제품 설명) 보여줄 지 여부
	const [showInfo, setShowInfo] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	return (
		<div
			className={styles.productItem}
			onMouseEnter={() => {
				setIsClosing(false);
				setShowInfo(true);
			}}
			onMouseLeave={() => {
				setIsClosing(true);
			}}
			onAnimationEnd={() => {
				if (!isClosing) return;
				setShowInfo(false);
			}}
		>
			<SmartImage src={getUploadImageUrl(product.filePath)} alt={product.fileName} width={200} height={200} />
			{(!!product.wishId || loginOn) && (
				<WishButton initWishOn={!!product.wishId} productId={product.productId} bottom={4} right={4} size={23} />
			)}
			{showInfo && (
				<div
					className={clsx(styles.productInfo, {
						animateFadeOut: isClosing,
						animateFadeIn: !isClosing,
					})}
				>
					<h4 className={styles.productBrand}>{product.sellerName}</h4>
					<h5 className={styles.productName}>
						<Link href={`/product/detail/${product.productId}`}>{product.productName}</Link>
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

					<Link href={`/product/detail/${product.productId}`} className={styles.detailLink}>
						<FaChevronCircleRight />
					</Link>
				</div>
			)}
		</div>
	);
};
