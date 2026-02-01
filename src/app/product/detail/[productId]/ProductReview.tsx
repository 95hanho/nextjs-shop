// 제품 리뷰
"use client";

import { ReviewStar } from "@/components/product/ReviewStar";
import { money } from "@/lib/format";

export default function ProductReview() {
	return (
		<section id="review-info-section">
			<h2>
				<span>리뷰({money(13250)}개)</span>
				<span>
					<ReviewStar rate={3.5} />
				</span>
			</h2>
			{/* 사진 모음 */}
			<div className="">
				<div>
					<img src="" alt="" />
				</div>
				<div>
					<img src="" alt="" />
				</div>
				<div>
					<img src="" alt="" />
				</div>
				<div>
					<img src="" alt="" />
				</div>
			</div>
			{/* 리뷰리스트 : 사진, 별점, 아이디(필터링), 내용, 작성날짜 */}
			<div className=""></div>
			{/* 리뷰 페이지네이션 */}
			<div className="review-pagination">
				<button></button>
			</div>
		</section>
	);
}
