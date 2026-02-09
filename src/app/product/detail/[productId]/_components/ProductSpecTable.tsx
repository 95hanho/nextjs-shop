import styles from "../ProductDetail.module.scss";

export default function ProductSpecTable() {
	return (
		<article className={styles.productSpecTable}>
			<h2>상품정보보기</h2>
			<table>
				<tbody>
					<tr>
						<th>제품 소재</th>
						<td>겉감:면100%</td>
					</tr>
					<tr>
						<th>색상</th>
						<td>상세페이지 참조</td>
					</tr>
					<tr>
						<th>치수</th>
						<td>상세페이지 참조</td>
					</tr>
					<tr>
						<th>제조자</th>
						<td>㈜이터널그룹</td>
					</tr>
					<tr>
						<th>제조국</th>
						<td>대한민국</td>
					</tr>
					<tr>
						<th>세탁방법 및 취급시 주의사항</th>
						<td>상세페이지 참조 (케어라벨 참조)</td>
					</tr>
					<tr>
						<th>제조연월</th>
						<td>202503</td>
					</tr>
					<tr>
						<th>품질보증기준</th>
						<td>관련법 및 소비자분쟁해결 규정에 따름</td>
					</tr>
					<tr>
						<th>A/S 책임자와 전화번호</th>
						<td>(주)이터널그룹/080-202-2023</td>
					</tr>
				</tbody>
			</table>
		</article>
	);
}
