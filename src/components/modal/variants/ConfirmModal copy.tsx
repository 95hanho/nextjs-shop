import { useModalStore } from "@/store/modal.store";
import { ModalResultMap } from "@/store/modal.type";
import { BsXLg } from "react-icons/bs";

interface ConfirmModalProps {
	onClose: () => void;
	title?: string;
	content: string;
	cancelText?: string;
	confirmText?: string;
	okResult?: string;
	cancelResult?: string;
}

export default function ConfirmModal({ onClose, title, content, cancelText, confirmText, okResult, cancelResult }: ConfirmModalProps) {
	const { resolveModal } = useModalStore();
	return (
		<div id="confirmModal" className="modal-wrap">
			<header className="modal-header">{title || "알림창"}</header>
			<button className="modal-close" onClick={onClose}>
				<BsXLg />
			</button>
			{/*  */}
			<div className="modal-content">
				<p className="modal-confirm__content">{content}</p>
				{/* 버튼 */}
				<div className="option-actions">
					<button
						className="option-actions__cancel"
						onClick={() => {
							if (cancelResult) {
								resolveModal({
									action: "CONFIRM_CANCEL",
									payload: {
										result: cancelResult,
									},
								});
							} else onClose();
						}}
					>
						{cancelText || "취소"}
					</button>
					<button
						className={`option-actions__submit`}
						onClick={() => {
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
						}}
					>
						{confirmText || "확인"}
					</button>
				</div>
			</div>
		</div>
	);
}
