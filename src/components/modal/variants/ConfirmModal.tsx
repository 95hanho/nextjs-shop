import { ModalFrame } from "@/components/modal/frame/ModalFrame";
import { ConfirmCancelResult, ConfirmOkResult, DialogResultMap } from "@/store/modal.type";
import styles from "../Modal.module.scss";
import { ConfirmButton } from "@/components/modal/frame/ConfirmButton";
import { useGlobalDialogStore } from "@/store/globalDialog.store";

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
	const { resolveDialog } = useGlobalDialogStore();

	const confirmModalProps = {
		cancelText,
		okText,
		onCancel: () => {
			if (cancelResult) {
				resolveDialog({
					action: "CONFIRM_CANCEL",
					payload: {
						result: cancelResult,
					},
				});
			} else onClose();
		},
		onConfirm: () => {
			let payload: DialogResultMap["CONFIRM_OK"] = undefined;
			if (okResult) {
				payload = {
					result: okResult,
				};
			}
			resolveDialog({
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
