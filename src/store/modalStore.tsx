import AlertModal from "@/components/modal/AlertModal";
import { ReactNode } from "react";
import { create } from "zustand";

type ModalType = "ALERT" | "CONFIRM" | "CART" | null;

type ModalProps = Record<string, any>;

interface ModalState {
	modalType: ModalType;
	modalProps: Record<string, any>;
}

interface ModalAction {
	openModal: (type: ModalType, props?: ModalProps) => void;
	closeModal: () => void;
}

export const useModalStore = create<ModalState & ModalAction>((set) => ({
	modalType: null,
	modalProps: {},
	openModal: (modalType, modalProps = {}) => set({ modalType, modalProps }),
	closeModal: () => set({ modalType: null, modalProps: {} }),
}));
