import BrandOtherProducts from "@/app/product/detail/[productId]/_components/BrandOtherProducts";
import { ImageFill } from "@/components/common/ImageFill";
import { BsChevronRight } from "react-icons/bs";
import { FiHeart } from "react-icons/fi";
import styles from "../ProductDetail.module.scss";

export default function SellerInfoSection() {
	return (
		<article className={styles.sellerInfoSection}>
			<h2>판매자정보</h2>

			<table>
				<tbody>
					<tr>
						<th>주식회사</th>
						<td>이터널그룹</td>
					</tr>
					<tr>
						<th>사업자등록번호</th>
						<td>7778601189</td>
					</tr>
					<tr>
						<th>통신판매업번호</th>
						<td>2021-서울성동-00392</td>
					</tr>
					<tr>
						<th>대표자</th>
						<td>민경준</td>
					</tr>
					<tr>
						<th>사업장 소재지</th>
						<td>(04799) 서울특별시 성동구 성수동2가 280-6 생각공장데시앙플렉스 1903,1905,1907,2004,2008호</td>
					</tr>
				</tbody>
			</table>

			<div className={styles.relatedBrandProducts}>
				<div className={styles.brandThumbnail}>
					<ImageFill />

					<button className={styles.brandLike}>
						<div>
							<FiHeart />
						</div>
						<p>93474</p>
					</button>

					<a className={styles.brandHomeLink} href="">
						<span className={styles.brandHomeLinkTitle}>Brand Home</span>
						<span className={styles.brandHomeLinkArrow}>
							<BsChevronRight />
						</span>
					</a>
				</div>
			</div>

			<div className={styles.brandOtherProducts}>
				<h3>판매자 다른 상품</h3>
				<div className={styles.imageSlide}>
					{/* 슬라이드 */}
					<BrandOtherProducts />
				</div>
			</div>
		</article>
	);
}
