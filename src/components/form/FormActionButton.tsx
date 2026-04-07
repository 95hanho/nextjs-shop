import clsx from "clsx";
import styles from "./Form.module.scss";

interface FormActionButtonProps {
	type?: "default" | "info";
	btnType?: "submit" | "button";
	title: string;
	onClick?: () => void;
}

export const FormActionButton = ({ type = "default", title, onClick, btnType = "submit" }: FormActionButtonProps) => {
	return (
		<div className={clsx(styles.submitWrap, styles[type])}>
			<input type={btnType} value={title} onClick={onClick} />
		</div>
	);
};
