"use client";

import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import styles from "../ProductDetail.module.scss";

// 등록된 상품정보이미지
export default function ProductBlog() {
	return (
		<article className={styles.productBlog}>
			<h2>상품 설명</h2>

			<div className={styles.productBlogWrap}>
				{[...Array(5)].map((_, i) => (
					<div key={i} className={styles.productBlogImagesWrap}>
						<div className={styles.productBlogImages}>
							<img src="https://ehfqntuqntu.cdn1.cafe24.com/main/4.jpg" alt="123" />
						</div>
					</div>
				))}
			</div>

			<button className={styles.descriptionMoreBtn}>
				<div>
					<span>상품 설명 {true ? "더보기" : "닫기"}</span>
					<span className={styles.moreIcon}>{true ? <IoIosArrowDown /> : <IoIosArrowUp />}</span>
				</div>
			</button>
		</article>
	);
}
