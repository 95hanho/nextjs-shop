import { FiMinus, FiPlus } from "react-icons/fi";
import styles from "./ProductCounter.module.scss";
import clsx from "clsx";

interface ProductCounterProps {
	count: number;
	setCount: (count: number) => void;
	stock: number;
}

// 상품 수량 UI 컴포넌트
export const ProductCounter = ({ count, setCount, stock }: ProductCounterProps) => {
	return (
		<div className={styles.counter}>
			<button
				className={clsx([styles.counterBtn, `${count === 1 && styles.off}`])}
				onClick={() => {
					if (count > 1) setCount(count - 1);
				}}
			>
				<FiMinus />
			</button>
			<span className={styles.counterQty}>{count}</span>
			<button
				className={clsx([styles.counterBtn, `${count === stock && styles.off}`])}
				onClick={() => {
					if (count < stock) setCount(count + 1);
				}}
			>
				<FiPlus />
			</button>
		</div>
	);
};
