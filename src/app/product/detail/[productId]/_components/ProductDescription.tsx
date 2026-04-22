import { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import styles from "../ProductDetail.module.scss";
import { useParams } from "next/navigation";

export default function ProductDescription() {
	// 1) [store / custom hooks] -------------------------------------------
	const params = useParams<{
		productId: string;
	}>();
	const productIdNum = Number(params.productId);

	// 2) [useState / useRef] ----------------------------------------------
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
				<h3 className={styles.productNumber}>
					<strong>상품번호 : </strong>
					<span>{productIdNum}</span>
				</h3>
			)}
		</article>
	);
}
