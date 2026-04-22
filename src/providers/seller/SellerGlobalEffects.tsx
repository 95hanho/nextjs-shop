import { useSellerAuth } from "@/hooks/useSellerAuth";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import { DialogResultMap } from "@/store/modal.type";
import { useEffect } from "react";

// 판매자 인증 관련 전역 효과 처리 (로그아웃 처리)
export function SellerGlobalEffects() {
	// 1) [store / custom hooks] -------------------------------------------
	const { logout } = useSellerAuth();
	const { dialogResult, clearDialogResult } = useGlobalDialogStore();

	// 6) [useEffect] ------------------------------------------------------
	// 로그아웃 모달 닫힌 후 처리
	useEffect(() => {
		if (!dialogResult) return;

		const run = async () => {
			try {
				if (dialogResult.action === "DIALOG_CLOSE") {
					const payload = dialogResult.payload as DialogResultMap["DIALOG_CLOSE"];
					if (payload?.result === "SELLER_LOGOUT") {
						// ✅ 여기서 logout을 “AuthProvider의 logout” 그대로 재사용
						await logout();
					}
				}
			} finally {
				// ✅ 한 번 처리했으면 비워주기 (중복 처리 방지)
				clearDialogResult();
			}
		};
		run();
	}, [dialogResult, clearDialogResult, logout]);

	return null;
}
