"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
// 예시용 모달 컴포넌트들
import { useModalStore } from "@/store/modal.store";
import { AlertModal } from "../variants/AlertModal";
import { ConfirmModal } from "../variants/ConfirmModal";
import { ProductOptionModal } from "../domain/ProductOptionModal";
import { AddressModal } from "../domain/AddressModal";
import { CartItem, UserAddressListItem } from "@/types/mypage";
import { ModalPropsMap } from "@/store/modal.type";
import styles from "../Modal.module.scss";

type ModalCommon = {
	disableOverlayClose?: boolean;
	disableEscClose?: boolean;
};

export const ModalRoot = () => {
	const { modalType, modalProps, closeModal } = useModalStore();
	const [mounted, setMounted] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [isOpen, setIsOpen] = useState(true);

	const common = (modalProps ?? {}) as ModalCommon;
	const overlayCloseAllowed = !common.disableOverlayClose;
	const escCloseAllowed = !common.disableEscClose;

	// Next SSR 때문에 portal은 클라이언트에서만
	useEffect(() => {
		setMounted(true);
	}, []);
	// 새 모달 열릴 때는 isClosing 초기화
	// body scroll lock
	useEffect(() => {
		console.log("modalType", modalType);
		if (modalType) {
			setIsOpen(true);
			setIsClosing(false);
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
	}, [modalType]);

	const handleClose = useCallback(() => {
		setIsClosing(true);
		setTimeout(() => {
			setIsOpen(false);
			closeModal();
		}, 400); // 애니메이션 시간과 맞추기
	}, [closeModal]);

	// ESC 눌러서 닫기
	useEffect(() => {
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				if (!escCloseAllowed) return;
				handleClose();
			}
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [closeModal, escCloseAllowed, handleClose]);

	if (!mounted || !modalType) return null;

	let childrenModal: React.ReactNode = null;

	switch (modalType) {
		case "ALERT": {
			const props = modalProps as ModalPropsMap["ALERT"]; // 여기서 타입 보장
			childrenModal = <AlertModal {...props} onClose={handleClose} />;
			break;
		}
		case "CONFIRM": {
			const props = modalProps as ModalPropsMap["CONFIRM"];
			childrenModal = <ConfirmModal {...props} onClose={handleClose} />;
			break;
		}
		case "PRODUCTOPTION":
			const { product } = modalProps as { product: CartItem };

			childrenModal = <ProductOptionModal onClose={handleClose} product={product} />;
			break;
		case "ADDRESSSET":
			const { address } = modalProps as { address: UserAddressListItem };

			childrenModal = <AddressModal onClose={handleClose} prevAddress={address} />;
			break;
		default:
			return null;
	}

	if (!isOpen) return null;

	// createPortal(요소, document.body) : DOM 구조는 여기지만, 실제 출력은 body 바로 아래에 그려라
	return createPortal(
		<div
			id="modalRoot"
			className={`
        fixed inset-0 z-[1000] flex items-center justify-center 
        bg-black/50
        ${isClosing ? styles.animateFadeOut : styles.animateFadeIn}
      `}
			onClick={() => {
				if (!overlayCloseAllowed) return;
				handleClose();
			}}
		>
			<div
				className={`
          relative z-[1001]
          ${isClosing ? styles.animatePopOut : styles.animatePopIn}
        `}
				onClick={(e) => e.stopPropagation()}
			>
				{childrenModal}
			</div>
		</div>,
		document.body,
	);
};
