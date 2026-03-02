import { useSellerAuth } from "@/hooks/useSellerAuth";
import { useModalStore } from "@/store/modal.store";
import { ModalResultMap } from "@/store/modal.type";
import { useEffect } from "react";

// 판매자 인증 관련 전역 효과 처리 (로그아웃 처리)
export function SellerGlobalEffects() {
	const { logout } = useSellerAuth();
	const { modalResult, clearModalResult } = useModalStore();

	// 로그아웃 모달 닫힌 후 처리
	useEffect(() => {
		if (!modalResult) return;
		const run = async () => {
			try {
				if (modalResult.action === "CLOSE") {
					const payload = modalResult.payload as ModalResultMap["CLOSE"];
					if (payload?.result === "SELLER_LOGOUT") {
						// ✅ 여기서 logout을 “AuthProvider의 logout” 그대로 재사용
						await logout();
					}
				}
			} finally {
				// ✅ 한 번 처리했으면 비워주기 (중복 처리 방지)
				clearModalResult();
			}
		};
		run();
	}, [modalResult, clearModalResult, logout]);

	return null;
}
