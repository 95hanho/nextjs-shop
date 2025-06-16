"use client";

import { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

export default function ProductDescription() {
	const [openDescription, set_openDescription] = useState(false);

	return (
		<article className="description-toggle">
			<button
				onClick={() => {
					set_openDescription(!openDescription);
				}}
			>
				<h2>상품정보</h2>
				<span>{openDescription ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
			</button>
			{openDescription && (
				<h3 className="product-number">
					<strong>상품번호 : </strong>
					<span>3167608</span>
				</h3>
			)}
		</article>
	);
}
