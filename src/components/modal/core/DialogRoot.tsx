"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
// 예시용 모달 컴포넌트들
import { AlertModal } from "../variants/AlertModal";
import { ConfirmModal } from "../variants/ConfirmModal";
import { DialogPropsMap } from "@/store/modal.type";
import clsx from "clsx";
import { useGlobalDialogStore } from "@/store/globalDialog.store";

type ModalCommon = {
	disableOverlayClose?: boolean;
	disableEscClose?: boolean;
	closeResult?: string;
	handleAfterClose?: () => void;
};

export const DialogRoot = () => {
	// 1) [store / custom hooks] -------------------------------------------
	const { modalType, modalProps, closeDialog } = useGlobalDialogStore();

	// 2) [useState / useRef] ----------------------------------------------
	const [mounted, setMounted] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [isOpen, setIsOpen] = useState(true);

	// 4) [derived values / useMemo] ---------------------------------------
	const common = (modalProps ?? {}) as ModalCommon;
	const overlayCloseAllowed = !common.disableOverlayClose;
	const escCloseAllowed = !common.disableEscClose;
	const closeResult = common.closeResult;
	const handleAfterClose = common.handleAfterClose;

	// 5) [handlers / useCallback] -----------------------------------------
	const handleClose = useCallback(() => {
		setIsClosing(true);
	}, []);

	// 6) [useEffect] ------------------------------------------------------
	// Next SSR 때문에 portal은 클라이언트에서만
	useEffect(() => {
		setMounted(true);
	}, []);
	// 새 모달 열릴 때는 isClosing 초기화
	// body scroll lock
	useEffect(() => {
		if (modalType) {
			setIsOpen(true);
			setIsClosing(false);
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
	}, [modalType]);
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
	}, [closeDialog, escCloseAllowed, handleClose]);

	// 7) [UI helper values] -------------------------------------------------
	// 모달 몸통
	let childrenModal: React.ReactNode = null;

	// 8) [return] ---------------------------------------------------------
	if (!mounted || !modalType) return null;
	switch (modalType) {
		case "ALERT": {
			const props = modalProps as DialogPropsMap["ALERT"]; // 여기서 타입 보장
			childrenModal = <AlertModal {...props} onClose={handleClose} />;
			break;
		}
		case "CONFIRM": {
			const props = modalProps as DialogPropsMap["CONFIRM"];
			childrenModal = <ConfirmModal {...props} onClose={handleClose} />;
			break;
		}
		default:
			return null;
	}
	if (!isOpen) return null;
	// createPortal(요소, document.body) : DOM 구조는 여기지만, 실제 출력은 body 바로 아래에 그려라
	return createPortal(
		<div
			id="dialogRoot"
			className={clsx(`fixed inset-0 z-[1100] flex items-center justify-center bg-black/50`, {
				animateFadeOut: isClosing,
				animateFadeIn: !isClosing,
			})}
			onClick={() => {
				if (!overlayCloseAllowed) return;
				handleClose();
			}}
			// 애니메이션 끝나면 실제로 모달 닫기
			onAnimationEnd={() => {
				if (!isClosing) return;
				setIsOpen(false);
				closeDialog(closeResult);
				if (handleAfterClose) handleAfterClose();
			}}
		>
			<div className={clsx(`relative z-[1101]`, { animatePopOut: isClosing, animatePopIn: !isClosing })} onClick={(e) => e.stopPropagation()}>
				{childrenModal}
			</div>
		</div>,
		document.body,
	);
};
