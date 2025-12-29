"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
// 예시용 모달 컴포넌트들
import { useModalStore } from "@/store/modal.store";
import AlertModal from "./AlertModal";
import ConfirmModal from "./ConfirmModal";
import ProductOptionModal from "./ProductOptionModal";
import { CartItem, UserAddressListItem } from "@/types/mypage";
import { ModalPropsMap } from "@/store/modal.type";
import AddressUpdateModal from "./AddressUpdateModal";

export default function ModalRoot() {
	const { modalType, modalProps, closeModal } = useModalStore();
	const [mounted, setMounted] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [isOpen, setIsOpen] = useState(true);

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

	// ESC 눌러서 닫기
	useEffect(() => {
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") handleClose();
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [closeModal]);

	if (!mounted || !modalType) return null;

	const handleClose = () => {
		setIsClosing(true);
		setTimeout(() => {
			setIsOpen(false);
			closeModal();
		}, 400); // 애니메이션 시간과 맞추기
	};

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
		case "ADDRESSUPDATE":
			const { address } = modalProps as { address: UserAddressListItem };

			childrenModal = <AddressUpdateModal onClose={handleClose} address={address} />;
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
        ${isClosing ? "animate-fadeOut" : "animate-fadeIn"}
      `}
			onClick={handleClose}
		>
			<div
				className={`
          relative z-[1001]
          ${isClosing ? "animate-popOut" : "animate-popIn"}
        `}
				onClick={(e) => e.stopPropagation()}
			>
				{childrenModal}
			</div>
		</div>,
		document.body
	);
}
/* 
"use client";

import { useModalStore } from "@/store/modal.store";

export function DeleteButton({ id }: { id: number }) {
  const openModal = useModalStore((state) => state.openModal);

  return (
    <button
      onClick={() =>
        openModal("CONFIRM", {
          title: "상품을 삭제하시겠습니까?",
          description: "삭제 후에는 복구할 수 없습니다.",
          targetId: id,
        })
      }
    >
      삭제
    </button>
  );
}
*/
