import { useModalStore } from "@/store/modal.store";
import { BsXLg } from "react-icons/bs";

interface ConfirmModalProps {
	onClose: () => void;
	title?: string;
	content: string;
	cancelText?: string;
	okText?: string;
	cancelResult?: boolean;
}

export default function ConfirmModal({ onClose, title, content, cancelText, okText, cancelResult }: ConfirmModalProps) {
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
									payload: undefined,
								});
							} else onClose();
						}}
					>
						{cancelText || "취소"}
					</button>
					<button
						className={`option-actions__submit`}
						onClick={() => {
							resolveModal({
								action: "CONFIRM_OK",
								payload: undefined,
							});
						}}
					>
						{okText || "확인"}
					</button>
				</div>
			</div>
		</div>
	);
}
