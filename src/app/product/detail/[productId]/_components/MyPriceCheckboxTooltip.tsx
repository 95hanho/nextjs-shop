import { IoMdDownload } from "react-icons/io";
import styles from "../ProductDetail.module.scss";

interface MyPriceCheckboxTooltipProps {
	title: string;
}

export default function MyPriceCheckboxTooltip({ title }: MyPriceCheckboxTooltipProps) {
	return (
		<div className={styles.myPriceCheckboxTooltip}>
			<div className={styles.checkbox}>
				<input type="checkbox" />
				<span>{title}</span>
				<mark>중복불가</mark>
			</div>
			<div className={styles.discountInfo}>
				<strong>-1,160원</strong>
				<button>
					받기
					<IoMdDownload />
				</button>
			</div>
		</div>
	);
}
