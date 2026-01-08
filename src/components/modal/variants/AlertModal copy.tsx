/* 알림용 모달 */
"use client";

import { BsXLg } from "react-icons/bs";

interface AlertModalProps {
	content: string;
	onClose: () => void;
}

export default function AlertModal({ content, onClose }: AlertModalProps) {
	return (
		<div id="alertModal" className="modal-wrap">
			<header className="modal-header">알림창</header>
			<button className="modal-close" onClick={onClose}>
				<BsXLg />
			</button>
			<div className="modal-content">{content}</div>
		</div>
	);
}
