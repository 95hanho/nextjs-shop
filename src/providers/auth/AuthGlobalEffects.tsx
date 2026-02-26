import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useModalStore } from "@/store/modal.store";
import { ModalResultMap } from "@/store/modal.type";
import { useAuth } from "@/hooks/useAuth";

// 공통 인증 관련 전역 효과 처리 (로그아웃 모달 닫힌 후, 인증 오류 등)
export function AuthGlobalEffects() {
	const { logout } = useAuth();
	const { modalResult, clearModalResult } = useModalStore();
	const router = useRouter();
	const pathname = usePathname();

	// 로그아웃 모달 닫힌 후 처리
	useEffect(() => {
		if (!modalResult) return;
		const run = async () => {
			try {
				if (modalResult.action === "CONFIRM_OK") {
					const payload = modalResult.payload as ModalResultMap["CONFIRM_OK"];
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
				if (modalResult.action === "CLOSE") {
					const payload = modalResult.payload as ModalResultMap["CLOSE"];
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
				clearModalResult();
			}
		};
		run();
	}, [modalResult, clearModalResult, logout, router, pathname]);

	return null;
}
