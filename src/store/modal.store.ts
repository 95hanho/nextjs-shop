import { create } from "zustand";
import { DomainModalCloseResult, DomainModalProps, DomainModalResult, DomainModalType, OpenDomainModal } from "./modal.type";

interface ModalState {
	modalType: DomainModalType;
	modalProps: DomainModalProps;
	modalResult: DomainModalResult | null; // ✅ 결과 저장
}
interface ModalAction {
	openModal: OpenDomainModal;
	closeModal: (closeResult?: DomainModalCloseResult) => void;
	resolveModal: (result: DomainModalResult) => void;
	clearModalResult: () => void;
}

export const useModalStore = create<ModalState & ModalAction>((set) => ({
	modalType: null,
	modalProps: {},
	modalResult: null,
	openModal: (modalType, modalProps) => set({ modalType, modalProps, modalResult: null }),
	closeModal: (closeResult) =>
		set({
			modalType: null,
			modalProps: {},
			modalResult: {
				action: "DOMAIN_CLOSE",
				payload: closeResult ? { result: closeResult } : undefined,
			},
		}),
	resolveModal: (result) => set({ modalType: null, modalProps: {}, modalResult: result }),
	clearModalResult: () => set({ modalType: null, modalProps: {}, modalResult: null }),
}));
