import { ModalFrame } from "@/components/modal/frame/ModalFrame";
import { useModalStore } from "@/store/modal.store";
import { ModalResultMap } from "@/store/modal.type";
import styles from "../Modal.module.scss";
import { ConfirmButton } from "@/components/modal/frame/ConfirmButton";

interface ConfirmModalProps {
	onClose: () => void;
	title?: string;
	content: string;
	cancelText?: string;
	confirmText?: string;
	okResult?: string;
	cancelResult?: string;
	hideCancel?: boolean;
}

export const ConfirmModal = ({ onClose, title, content, cancelText, confirmText, okResult, cancelResult, hideCancel }: ConfirmModalProps) => {
	const { resolveModal } = useModalStore();

	const confirmModalProps = {
		cancelText,
		confirmText,
		onCancel: () => {
			if (cancelResult) {
				resolveModal({
					action: "CONFIRM_CANCEL",
					payload: {
						result: cancelResult,
					},
				});
			} else onClose();
		},
		onConfirm: () => {
			let payload: ModalResultMap["CONFIRM_OK"] = undefined;
			if (okResult) {
				payload = {
					result: okResult,
				};
			}
			resolveModal({
				action: "CONFIRM_OK",
				payload,
			});
		},
		hideCancel,
	};
	return (
		<ModalFrame title={title} onClose={onClose}>
			<p className={styles.modalConfirmContent}>{content}</p>
			<ConfirmButton {...confirmModalProps} />
		</ModalFrame>
	);
};
