import clsx from "clsx";
import styles from "./Form.module.scss";

interface FormActionButtonProps {
	type?: "default" | "info";
	btnType?: "submit" | "button";
	title: string;
	onClick?: () => void;
	disabled?: boolean;
}

export const FormActionButton = ({ type = "default", title, onClick, btnType = "submit", disabled = false }: FormActionButtonProps) => {
	return (
		<div className={clsx(styles.submitWrap, styles[type])}>
			<input type={btnType} value={title} onClick={onClick} disabled={disabled} />
		</div>
	);
};
