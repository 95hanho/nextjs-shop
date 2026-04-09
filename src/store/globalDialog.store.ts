import { create } from "zustand";
import { DialogProps, DialogResult, DialogType, OpenDialog } from "./modal.type";

interface ModalState {
	modalType: DialogType;
	modalProps: DialogProps;
	dialogResult: DialogResult | null; // ✅ 결과 저장
}

interface ModalAction {
	openDialog: OpenDialog;
	closeDialog: (closeResult?: string) => void;
	resolveDialog: (result: DialogResult) => void;
	clearDialogResult: () => void;
}

export const useGlobalDialogStore = create<ModalState & ModalAction>((set) => ({
	modalType: null,
	modalProps: {},
	dialogResult: null,
	openDialog: (modalType, modalProps) => set({ modalType, modalProps, dialogResult: null }),
	closeDialog: (closeResult) =>
		set({
			modalType: null,
			modalProps: {},
			dialogResult: {
				action: "DIALOG_CLOSE",
				payload: closeResult ? { result: closeResult } : undefined,
			},
		}),
	resolveDialog: (result) => set({ modalType: null, modalProps: {}, dialogResult: result }),
	clearDialogResult: () => set({ modalType: null, modalProps: {}, dialogResult: null }),
}));
