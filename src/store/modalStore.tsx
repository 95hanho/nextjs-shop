import { create } from "zustand";

type ModalType = "ALERT" | "CONFIRM" | "PRODUCTOPTION" | null;

// 모달이 닫힐 때 “무슨 동작이었는지”
type ModalResultAction = "PRODUCTOPTION_CHANGED" | "CONFIRM_OK" | "CONFIRM_CANCEL" | "ALERT_OK" | "CLOSE";

// 모달이 닫힐 때 “전달할 데이터”
type ModalResultPayload =
	| {
			// PRODUCTOPTION_CHANGED
			cartId: number;
			productDetailId: number;
			quantity: number;
	  }
	| Record<string, any>
	| undefined;

interface ModalState {
	modalType: ModalType;
	modalProps: ModalProps;
	modalResult: ModalResult | null; // ✅ 결과 저장
}

type ModalResult = {
	action: ModalResultAction;
	payload?: ModalResultPayload;
};

type ModalProps = Record<string, any>;
interface ModalAction {
	openModal: (type: ModalType, props?: ModalProps) => void;
	closeModal: () => void;
	// ✅ “확정/선택완료” 처럼 결과를 전달하며 닫기
	resolveModal: (result: ModalResult) => void;
	// ✅ 결과 소비 후 초기화
	clearModalResult: () => void;
}

export const useModalStore = create<ModalState & ModalAction>((set) => ({
	modalType: null,
	modalProps: {},
	modalResult: null,
	openModal: (modalType, modalProps = {}) => set({ modalType, modalProps, modalResult: null }),
	closeModal: () => set({ modalType: null, modalProps: {} }),
	resolveModal: (result) => set({ modalType: null, modalProps: {}, modalResult: result }),
	clearModalResult: () => set({ modalResult: null }),
}));
