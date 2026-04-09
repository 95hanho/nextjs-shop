"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
// 예시용 모달 컴포넌트들
import { useModalStore } from "@/store/modal.store";
import { ProductOptionModal } from "../domain/ProductOptionModal";
import clsx from "clsx";
import { ShippingAddressEditorModal } from "@/components/modal/domain/ShippingAddressEditorModal";
import { BuyShippingAddressListModal } from "@/components/modal/domain/BuyShippingAddressListModal";
import { SellerCouponModal } from "@/components/modal/domain/SellerCouponModal";
import { DomainModalCloseResult, DomainModalPropsMap } from "@/store/modal.type";
import { SellerProductOptionModal } from "@/components/modal/domain/SellerProductOptionModal";

type ModalCommon = {
	disableOverlayClose?: boolean;
	disableEscClose?: boolean;
	closeResult?: DomainModalCloseResult;
	handleAfterClose?: () => void;
};

export const DomainModalRoot = () => {
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
		case "PRODUCT_OPTION":
			const { product } = modalProps as DomainModalPropsMap["PRODUCT_OPTION"];

			childrenModal = <ProductOptionModal onClose={handleClose} product={product} />;
			break;
		case "ADDRESS_SET":
			const { prevAddress } = modalProps as DomainModalPropsMap["ADDRESS_SET"];

			childrenModal = <ShippingAddressEditorModal onClose={handleClose} prevAddress={prevAddress} />;
			break;
		case "BUY_ADDRESSLIST":
			childrenModal = <BuyShippingAddressListModal onClose={handleClose} />;
			break;
		case "SELLER_COUPON":
			const { prevSellerCoupon } = modalProps as DomainModalPropsMap["SELLER_COUPON"];

			childrenModal = <SellerCouponModal onClose={handleClose} prevSellerCoupon={prevSellerCoupon} />;
			break;
		case "SELLER_PRODUCT_OPTION":
			const { prevSellerProductOption, productOptionSizeDuplicateList } = modalProps as DomainModalPropsMap["SELLER_PRODUCT_OPTION"];

			childrenModal = (
				<SellerProductOptionModal
					onClose={handleClose}
					prevSellerProductOption={prevSellerProductOption}
					productOptionSizeDuplicateList={productOptionSizeDuplicateList}
				/>
			);
			break;
		default:
			return null;
	}

	if (!isOpen) return null;

	// createPortal(요소, document.body) : DOM 구조는 여기지만, 실제 출력은 body 바로 아래에 그려라
	return createPortal(
		<div
			id="domainModalRoot"
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
