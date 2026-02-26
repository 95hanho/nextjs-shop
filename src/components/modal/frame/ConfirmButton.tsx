import clsx from "clsx";
import styles from "../Modal.module.scss";

interface ConfirmButtonProps {
	cancelText?: string;
	confirmText?: string;
	onCancel: () => void;
	onConfirm: () => void;
	confirmDisabled?: boolean;
	hideCancel?: boolean;
}

export const ConfirmButton = ({
	cancelText = "취소",
	confirmText = "확인",
	onCancel,
	onConfirm,
	confirmDisabled,
	hideCancel = false,
}: ConfirmButtonProps) => {
	return (
		<div className={clsx(styles.ConfirmButton, hideCancel && styles.hideCancel)}>
			{!hideCancel && (
				<button type="button" onClick={onCancel}>
					{cancelText}
				</button>
			)}
			<button type="button" className={confirmDisabled ? styles.off : ""} onClick={onConfirm}>
				{confirmText}
			</button>
		</div>
	);
};
