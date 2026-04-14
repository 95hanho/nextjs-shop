import { ProductDetailResponse } from "@/types/product";
import styles from "../ProductDetail.module.scss";
import moment from "moment";

export default function ProductSpecTable({ productDetail }: { productDetail: ProductDetailResponse }) {
	return (
		<article className={styles.productSpecTable}>
			<h2>상품정보보기</h2>
			<table>
				<tbody>
					{productDetail.materialInfo && (
						<tr>
							<th>제품 소재</th>
							<td>{productDetail.materialInfo}</td>
						</tr>
					)}
					{productDetail.colorName && (
						<tr>
							<th>색상</th>
							<td>{productDetail.colorName}</td>
						</tr>
					)}
					<tr>
						<th>치수</th>
						<td>상세페이지 참조</td>
					</tr>
					{productDetail.manufacturerName && (
						<tr>
							<th>제조자</th>
							<td>{productDetail.manufacturerName}</td>
						</tr>
					)}
					{productDetail.countryOfOrigin && (
						<tr>
							<th>제조국</th>
							<td>{productDetail.countryOfOrigin}</td>
						</tr>
					)}

					{productDetail.washCareInfo && (
						<tr>
							<th>세탁방법 및 취급시 주의사항</th>
							<td>{productDetail.washCareInfo}</td>
						</tr>
					)}
					{productDetail.manufacturedYm && (
						<tr>
							<th>제조연월</th>
							<td>{moment(productDetail.manufacturedYm, "YYYYMM").format("YYYY년 MM월")}</td>
						</tr>
					)}
					{productDetail.qualityGuaranteeInfo && (
						<tr>
							<th>품질보증기준</th>
							<td>{productDetail.qualityGuaranteeInfo}</td>
						</tr>
					)}
					{productDetail.afterServiceContact && (
						<tr>
							<th>A/S 책임자와 전화번호</th>
							<td>{productDetail.afterServiceContact}</td>
						</tr>
					)}
				</tbody>
			</table>
		</article>
	);
}
