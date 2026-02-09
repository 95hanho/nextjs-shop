import clsx from "clsx";
import styles from "./AuthActionButton.module.scss";

interface AuthActionButtonProps {
	type?: "default" | "info";
	btnType?: "submit" | "button";
	title: string;
	onClick?: () => void;
}

export const AuthActionButton = ({ type = "default", title, onClick, btnType = "submit" }: AuthActionButtonProps) => {
	return (
		<div className={clsx(styles.submitWrap, styles[type])}>
			<input type={btnType} value={title} onClick={onClick} />
		</div>
	);
};
