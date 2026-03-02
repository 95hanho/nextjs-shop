import clsx from "clsx";
import styles from "../Modal.module.scss";

interface ConfirmButtonProps {
	cancelText?: string;
	okText?: string;
	onCancel: () => void;
	onConfirm: () => void;
	confirmDisabled?: boolean;
	hideCancel?: boolean;
	reverse?: boolean;
}

export const ConfirmButton = ({
	cancelText = "취소",
	okText = "확인",
	onCancel,
	onConfirm,
	confirmDisabled,
	hideCancel = false,
	reverse = false,
}: ConfirmButtonProps) => {
	const CancelButton = (
		<>
			{!hideCancel && (
				<button type="button" onClick={onCancel}>
					{cancelText}
				</button>
			)}
		</>
	);
	const OkButton = (
		<button type="button" className={confirmDisabled ? styles.off : ""} onClick={onConfirm}>
			{okText}
		</button>
	);

	return (
		<div className={clsx(styles.ConfirmButton, hideCancel && styles.hideCancel)}>
			{!reverse ? (
				<>
					{CancelButton}
					{OkButton}
				</>
			) : (
				<>
					{OkButton}
					{CancelButton}
				</>
			)}
		</div>
	);
};
