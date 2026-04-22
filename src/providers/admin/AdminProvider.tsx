import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { adminAuthContext } from "@/components/ui/context/authContext";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import { AdminInfo } from "@/types/admin";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

const initAdmin = {
	adminName: "",
	lastLoginAt: "",
};
interface SellerProviderProps {
	children: React.ReactNode;
}

export const AdminProvider = ({ children }: SellerProviderProps) => {
	// 1) [store / custom hooks] -------------------------------------------
	const queryClient = useQueryClient();
	const router = useRouter();
	const { openDialog } = useGlobalDialogStore();

	// 2) [useState / useRef] ----------------------------------------------
	const [admin, setAdmin] = useState<AdminInfo>(initAdmin);

	// 4) [derived values / useMemo] ---------------------------------------
	const loginOn = !!admin.adminName;

	// 5) [handlers / useCallback] -----------------------------------------
	const logout = async () => {
		console.log("로그아웃");
		setAdmin(initAdmin);
		queryClient.setQueryData(["adminInfo"], initAdmin); // 직접 캐시 업데이트
		await postJson(getApiUrl(API_URL.ADMIN_LOGOUT));
		router.replace("/admin/login"); // 로그아웃 후 로그인 페이지로 이동
		openDialog("ALERT", { content: "로그아웃 되었습니다." });
		location.reload();
	};

	return <adminAuthContext.Provider value={{ loginOn, logout, admin, setAdmin }}>{children}</adminAuthContext.Provider>;
};
