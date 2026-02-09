"use client";

import { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import styles from "../ProductDetail.module.scss";

export default function ProductDescription() {
	const [openDescription, setOpenDescription] = useState(false);

	return (
		<article className={styles.descriptionToggle}>
			<button
				onClick={() => {
					setOpenDescription(!openDescription);
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
