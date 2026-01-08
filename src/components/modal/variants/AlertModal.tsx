"use client";

import ModalFrame from "../frame/ModalFrame";

interface AlertModalProps {
	content: string;
	onClose: () => void;
}

export default function AlertModal({ content, onClose }: AlertModalProps) {
	return (
		<ModalFrame title="알림창" onClose={onClose}>
			{content}
		</ModalFrame>
	);
}
