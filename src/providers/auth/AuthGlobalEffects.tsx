import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import { DialogResultMap } from "@/store/modal.type";

// 공통 인증 관련 전역 효과 처리 (로그아웃 모달 닫힌 후, 인증 오류 등)
export function AuthGlobalEffects() {
	// 1) [store / custom hooks] -------------------------------------------
	const { logout } = useAuth();
	const { dialogResult, clearDialogResult } = useGlobalDialogStore();
	const router = useRouter();
	const pathname = usePathname();

	// 6) [useEffect] ------------------------------------------------------
	// 로그아웃 모달 닫힌 후 처리
	useEffect(() => {
		if (!dialogResult) return;
		const run = async () => {
			try {
				if (dialogResult.action === "CONFIRM_OK") {
					const payload = dialogResult.payload as DialogResultMap["CONFIRM_OK"];
					if (payload?.result === "NEED_LOGIN") {
						// ✅ 여기서 logout을 “AuthProvider의 logout” 그대로 재사용
						await logout();

						// 로그인 페이지로 보내고 싶으면 (returnUrl 포함)
						const returnUrl = encodeURIComponent(pathname);
						router.replace(`/user?returnUrl=${returnUrl}`);

						// replace가 완료되기 전에 refresh가 섞이는 걸 피함
						setTimeout(
							() => router.refresh(), // ✅ RSC 캐시 갱신 (로그인 페이지에서 최신 로그인 상태 반영 위해)
							0,
						);
					}
				}
				if (dialogResult.action === "DIALOG_CLOSE") {
					const payload = dialogResult.payload as DialogResultMap["DIALOG_CLOSE"];
					if (payload?.result === "NEED_LOGIN_CANCEL") {
						// ✅ 여기서 logout을 “AuthProvider의 logout” 그대로 재사용
						await logout();

						router.replace("/");
						// replace가 완료되기 전에 refresh가 섞이는 걸 피함
						setTimeout(
							() => router.refresh(), // ✅ RSC 캐시 갱신 (로그인 페이지에서 최신 로그인 상태 반영 위해)
							0,
						);
					}
				}
			} finally {
				// ✅ 한 번 처리했으면 비워주기 (중복 처리 방지)
				clearDialogResult();
			}
		};
		run();
	}, [dialogResult, clearDialogResult, logout, router, pathname]);

	return null;
}
