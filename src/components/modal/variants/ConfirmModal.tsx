import { ModalFrame } from "@/components/modal/frame/ModalFrame";
import { useModalStore } from "@/store/modal.store";
import { ConfirmCancelResult, ConfirmOkResult, ModalResultMap } from "@/store/modal.type";
import styles from "../Modal.module.scss";
import { ConfirmButton } from "@/components/modal/frame/ConfirmButton";

interface ConfirmModalProps {
	onClose: () => void;
	title?: string;
	content: string;
	cancelText?: string;
	okText?: string;
	okResult?: ConfirmOkResult;
	cancelResult?: ConfirmCancelResult;
	hideCancel?: boolean;
	reverse?: boolean;
}

export const ConfirmModal = ({ onClose, title, content, cancelText, okText, okResult, cancelResult, hideCancel, reverse }: ConfirmModalProps) => {
	const { resolveModal } = useModalStore();

	const confirmModalProps = {
		cancelText,
		okText,
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
		reverse,
	};
	return (
		<ModalFrame title={title} onClose={onClose}>
			<p className={styles.modalConfirmContent}>{content}</p>
			<ConfirmButton {...confirmModalProps} />
		</ModalFrame>
	);
};
