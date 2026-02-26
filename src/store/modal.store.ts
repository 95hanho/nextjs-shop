import { create } from "zustand";
import { ModalProps, ModalPropsMap, ModalResult, ModalType } from "./modal.type";

interface ModalState {
	modalType: ModalType;
	modalProps: ModalProps;
	modalResult: ModalResult | null; // ✅ 결과 저장
}

export type OpenModal = <T extends Exclude<ModalType, null>>(type: T, props: ModalPropsMap[T]) => void;
interface ModalAction {
	openModal: OpenModal;
	closeModal: (closeResult?: string) => void;
	resolveModal: (result: ModalResult) => void;
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
				action: "CLOSE",
				payload: closeResult ? { result: closeResult } : undefined,
			},
		}),
	resolveModal: (result) => set({ modalType: null, modalProps: {}, modalResult: result }),
	clearModalResult: () => set({ modalType: null, modalProps: {}, modalResult: null }),
}));
