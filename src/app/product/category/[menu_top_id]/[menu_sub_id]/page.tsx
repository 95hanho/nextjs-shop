import Image from "next/image";
import { SlArrowRight } from "react-icons/sl";
import { FaHeart } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import Link from "next/link";
import TestImage from "@/components/test/TestImage";
interface ProductListParams {
	params: {
		menu_sub_id: string;
		menu_top_id: string;
	};
}

const Test = () => {
	return (
		<div className="product-card">
			<div className="product-card__image">
				<Link href={"/product/detail/1"}>
					<TestImage />
				</Link>
			</div>
			<div className="product-card__info">
				<h6 className="product-card__badge">
					<Link href="#">
						하네
						<span>
							<SlArrowRight />
						</span>
					</Link>
				</h6>
				<Link href="/product/detail/1" className="product-info__link">
					<h5 className="product-card__title">[스크런치 SET] 텐셀 글로우 시어셔츠 5Color</h5>

					<h4 className="product-card__price">
						<strong className="product-card__discount">37%</strong>
						<span className="product-card__price-value">59,640</span>
					</h4>

					<div className="product-card__coupon">
						<span>쿠폰</span>
					</div>
				</Link>
				<div className="product-card__review">
					<label className="product-card__review-count">
						<FaHeart />
						<span>11,152</span>
					</label>
					<label className="product-card__rating">
						<FaStar />
						<span>4.8</span>
					</label>
				</div>
			</div>
		</div>
	);
};
export default function ProductList({ params: { menu_sub_id, menu_top_id } }: ProductListParams) {
	console.log(menu_sub_id, menu_top_id);
	return (
		<main id="productList">
			<div className="product-wrap">
				<Test />
				<Test />
				<Test />
				<Test />
				<Test />
				<Test />
			</div>
		</main>
	);
}
