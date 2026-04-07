"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
// 예시용 모달 컴포넌트들
import { useModalStore } from "@/store/modal.store";
import { AlertModal } from "../variants/AlertModal";
import { ConfirmModal } from "../variants/ConfirmModal";
import { ProductOptionModal } from "../domain/ProductOptionModal";
import { CartItem, UserAddressListItem } from "@/types/mypage";
import { ModalPropsMap } from "@/store/modal.type";
import clsx from "clsx";
import { ShippingAddressEditorModal } from "@/components/modal/domain/ShippingAddressEditorModal";
import { BuyShippingAddressListModal } from "@/components/modal/domain/BuyShippingAddressListModal";
import { SellerCoupon } from "@/types/seller";
import { SellerCouponModal } from "@/components/modal/domain/SellerCouponModal";

type ModalCommon = {
	disableOverlayClose?: boolean;
	disableEscClose?: boolean;
	closeResult?: string;
	handleAfterClose?: () => void;
};

export const ModalRoot = () => {
	const { modalType, modalProps, closeModal } = useModalStore();
	const [mounted, setMounted] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [isOpen, setIsOpen] = useState(true);

	const common = (modalProps ?? {}) as ModalCommon;
	const overlayCloseAllowed = !common.disableOverlayClose;
	const escCloseAllowed = !common.disableEscClose;
	const closeResult = common.closeResult;
	const handleAfterClose = common.handleAfterClose;

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

	const handleClose = useCallback(() => {
		setIsClosing(true);
	}, []);

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
		case "PRODUCT_OPTION":
			const { product } = modalProps as { product: CartItem };

			childrenModal = <ProductOptionModal onClose={handleClose} product={product} />;
			break;
		case "ADDRESS_SET":
			const { address } = modalProps as { address: UserAddressListItem };

			childrenModal = <ShippingAddressEditorModal onClose={handleClose} prevAddress={address} />;
			break;
		case "BUY_ADDRESSLIST":
			childrenModal = <BuyShippingAddressListModal onClose={handleClose} />;
			break;
		case "SELLER_COUPON":
			const { coupon } = modalProps as { coupon?: SellerCoupon };

			childrenModal = <SellerCouponModal onClose={handleClose} prevSellerCoupon={coupon} />;
			break;
		default:
			return null;
	}

	if (!isOpen) return null;

	// createPortal(요소, document.body) : DOM 구조는 여기지만, 실제 출력은 body 바로 아래에 그려라
	return createPortal(
		<div
			id="modalRoot"
			className={clsx(`fixed inset-0 z-[1000] flex items-center justify-center bg-black/50`, {
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
				closeModal(closeResult);
				if (handleAfterClose) handleAfterClose();
			}}
		>
			<div className={clsx(`relative z-[1001]`, { animatePopOut: isClosing, animatePopIn: !isClosing })} onClick={(e) => e.stopPropagation()}>
				{childrenModal}
			</div>
		</div>,
		document.body,
	);
};
