"use client";

import styles from "./ProductItem.module.scss";
import WishButton from "@/components/product/WishButton";
import ImageFill from "@/components/common/ImageFill";
import { FaHeart, FaStar } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/api/fetchFilter";
import { BaseResponse } from "@/types/common";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import useAuth from "@/hooks/useAuth";
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

export default function ProductItem({ product }: ProductItemProps) {
	// const { user } = useAuth();

	const handleProductWish = useMutation({
		mutationFn: () =>
			postJson<BaseResponse>(getApiUrl(API_URL.PRODUCT_WISH), {
				productId: product.productId,
			}),
		onSuccess(data) {
			console.log(data);
		},
		onError(err) {
			console.log(err);
		},
	});

	return (
		<Link href={`/product/detail/${product.productId}`} className={styles.productItem}>
			{/* 이미지 */}
			<div className={styles.productThumb}>
				<ImageFill src={product.filePath} fill={true} className={styles.productImg} />

				{/* WishButton 내부에서 className을 못 받는 구조면 유지, 받을 수 있으면 아래 주석처럼 */}
				<WishButton
					clickFnc={() => handleProductWish.mutate()}
					/* className={styles.productWishBtn} */
				/>
			</div>

			{/* 하단 상품설명 */}
			<div className={styles.productInfo}>
				<h4 className={styles.productBrand}>{product.sellerName}</h4>
				<h5 className={styles.productName}>{product.productName}</h5>

				<div className={styles.productPrice}>
					<div aria-live="polite">
						<span className={`${styles.summaryBadge} mr-1 text-red-500`}>
							{discountPercent(product.originPrice, product.finalPrice)}%
						</span>
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
}
