import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { sellerAuthContext } from "@/components/ui/context/authContext";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import { SellerInfo } from "@/types/seller";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SellerProviderProps {
	children: React.ReactNode;
}

const initSeller = {
	sellerName: "",
	sellerNameEn: "",
	extensionNumber: "",
	mobileNumber: "",
	email: "",
	businessRegistrationNumber: "",
	telecomSalesNumber: "",
	representativeName: "",
	businessZipcode: "",
	businessAddress: "",
	businessAddressDetail: "",
};

export const SellerProvider = ({ children }: SellerProviderProps) => {
	// 1) [store / custom hooks] -------------------------------------------
	const queryClient = useQueryClient();
	const router = useRouter();
	const { openDialog } = useGlobalDialogStore();

	// 2) [useState / useRef] ----------------------------------------------
	const [seller, setSeller] = useState<SellerInfo>(initSeller);

	// 4) [derived values / useMemo] ---------------------------------------
	const loginOn = !!seller.sellerName;

	// 5) [handlers / useCallback] -----------------------------------------
	const logout = async () => {
		console.log("로그아웃");
		setSeller(initSeller);
		queryClient.setQueryData(["sellerInfo"], initSeller); // 직접 캐시 업데이트
		await postJson(getApiUrl(API_URL.SELLER_LOGOUT));
		router.replace("/seller/login"); // 로그아웃 후 로그인 페이지로 이동
		openDialog("ALERT", { content: "로그아웃 되었습니다." });

		// replace가 완료되기 전에 refresh가 섞이는 걸 피함
		setTimeout(
			() => router.refresh(), // ✅ RSC 캐시 갱신 (로그인 페이지에서 최신 로그인 상태 반영 위해)
			0,
		);
	};

	return <sellerAuthContext.Provider value={{ loginOn, logout, seller, setSeller }}>{children}</sellerAuthContext.Provider>;
};
