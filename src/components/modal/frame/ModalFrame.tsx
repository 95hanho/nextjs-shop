import { ReactNode } from "react";
import { BsXLg } from "react-icons/bs";
import styles from "../Modal.module.scss";

type ModalFrameProps = {
	title?: string;
	onClose: () => void;
	children: ReactNode;
	modalWrapVariant?: "productOption" | ""; // 추가 예정
	contentVariant?: "address" | ""; // 추가 예정
};

export const ModalFrame = ({ title = "", onClose, children, modalWrapVariant, contentVariant }: ModalFrameProps) => {
	return (
		<div className={[styles.modalWrap, modalWrapVariant ? styles[modalWrapVariant] : ""].join(" ")}>
			<header className={styles.modalHeader}>{title}</header>

			<button type="button" className={styles.modalClose} onClick={onClose} aria-label="닫기">
				<BsXLg />
			</button>

			<section className={[styles.modalContent, contentVariant ? styles[contentVariant] : ""].join(" ")}>{children}</section>
		</div>
	);
};
