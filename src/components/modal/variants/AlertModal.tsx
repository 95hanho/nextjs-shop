import { ModalFrame } from "../frame/ModalFrame";

interface AlertModalProps {
	content: string;
	onClose: () => void;
}

export const AlertModal = ({ content, onClose }: AlertModalProps) => {
	return (
		<ModalFrame title="알림창" onClose={onClose}>
			<p dangerouslySetInnerHTML={{ __html: content }}></p>
		</ModalFrame>
	);
};
