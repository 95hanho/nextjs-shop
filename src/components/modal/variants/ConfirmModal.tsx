import { ModalFrame } from "@/components/modal/frame/ModalFrame";
import { DialogPropsMap, DialogResultMap } from "@/store/modal.type";
import styles from "../Modal.module.scss";
import { ConfirmButton } from "@/components/modal/frame/ConfirmButton";
import { useGlobalDialogStore } from "@/store/globalDialog.store";

type ConfirmModalProps = DialogPropsMap["CONFIRM"] & {
	onClose: () => void;
};

export const ConfirmModal = ({
	onClose,
	title,
	content,
	cancelText,
	okText,
	okResult,
	cancelResult,
	hideCancel,
	reverse,
	handleAfterOk,
}: ConfirmModalProps) => {
	// 1) [store / custom hooks] -------------------------------------------
	const { resolveDialog } = useGlobalDialogStore();

	// 7) UI helper values -------------------------------------------------
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
			if (handleAfterOk) handleAfterOk();
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
