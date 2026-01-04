"use client";

import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

// 등록된 상품정보이미지
export default function ProductBlog() {
	return (
		<article className="product-blog">
			<h2>상품 설명</h2>
			<div className="product-blog-wrap">
				{[...Array(5)].map((_, i) => (
					<div key={i} className="product-blog-images-wrap">
						<div className="product-blog-images">
							<img src={"https://ehfqntuqntu.cdn1.cafe24.com/main/4.jpg"} alt="123" />
						</div>
					</div>
				))}
			</div>

			<button className="description-more-btn">
				<div>
					<span>상품 설명 {true ? "더보기" : "닫기"}</span>
					<span className="more-icon">{true ? <IoIosArrowDown /> : <IoIosArrowUp />}</span>
				</div>
			</button>
		</article>
	);
}
