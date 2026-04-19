'use client";';

import { FormPageShell } from "@/components/form/FormPageShell";
import styles from "./ReviewWrite.module.scss";
import { money } from "@/lib/format";
import { SmartImage } from "@/components/ui/SmartImage";
import { getOrderStatusLabel } from "@/lib/order";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getNormal } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { GetProductDetailResponse } from "@/types/product";
import { useEffect } from "react";

export default function ReviewWriteClient() {
	const params = useParams();
	const productId = Number(params.productId);

	// ----------------------------------------------------------------
	// React Query
	// ----------------------------------------------------------------

	// 제품 상세보기 조회
	const { data: productDetail } = useQuery<GetProductDetailResponse, Error>({
		queryKey: ["productDetail", productId],
		queryFn: () => getNormal(getApiUrl(API_URL.PRODUCT_DETAIL), { productId }),
		enabled: !!productId,
	});

	useEffect(() => {
		if (productDetail) {
			console.log("productDetail", productDetail);
		}
	}, [productDetail]);

	return (
		<div className={styles.reviewWrite}>
			<FormPageShell title="리뷰 작성" wrapMinHeight={100} overflow="visible">
				<div>
					<div className={styles.orderHistoryItem}>
						<h5 className={styles.orderHistoryStatus}>{getOrderStatusLabel(item.status)}</h5>

						{/* 상품 정보 */}
						<div className={styles.orderHistoryProduct}>
							<div className={styles.orderHistoryThumb}>
								<SmartImage fill src={item.filePath} alt={item.productName + " 이미지"} />
							</div>

							<div className={styles.orderHistoryInfo}>
								<h5 className={styles.orderHistoryOption}>
									{item.size}
									{item.addPrice > 0 ? `(+${money(item.addPrice)})` : ""} / {item.count}개
								</h5>
								<h6 className={styles.orderHistoryPrice}>{money(item.finalPrice)}원</h6>
							</div>
						</div>
					</div>
				</div>
			</FormPageShell>
		</div>
	);
}
