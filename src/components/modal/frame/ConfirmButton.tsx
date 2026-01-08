"use client";

import styles from "./ConfirmButton.module.scss";

interface ConfirmButtonProps {
	cancelText?: string;
	confirmText?: string;
	onCancel: () => void;
	onConfirm: () => void;
	confirmDisabled?: boolean;
}

export default function ConfirmButton({ cancelText = "취소", confirmText = "확인", onCancel, onConfirm, confirmDisabled }: ConfirmButtonProps) {
	console.log("confirmDisabled", confirmDisabled);
	return (
		<div className={styles.ConfirmButton}>
			<button type="button" onClick={onCancel}>
				{cancelText}
			</button>
			<button type="button" className={confirmDisabled ? styles.off : ""} onClick={onConfirm}>
				{confirmText}
			</button>
		</div>
	);
}
