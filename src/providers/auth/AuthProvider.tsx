import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { authContext } from "@/components/ui/context/authContext";
import { getApiUrl } from "@/lib/getBaseUrl";
import { UserInfo } from "@/types/auth";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

interface AuthProviderProps {
	children: React.ReactNode;
}

const initUser = {
	name: "",
	zonecode: "",
	address: "",
	addressDetail: "",
	birthday: "",
	phone: "",
	email: "",
	createdAt: new Date(),
	mileage: 0,
	tall: 0,
	weight: 0,
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
	// 1) [store / custom hooks] -------------------------------------------
	const queryClient = useQueryClient();
	const pathname = usePathname();

	// 2) [useState / useRef] ----------------------------------------------
	const [user, setUser] = useState<UserInfo>(initUser);
	const [isAuthLoading, setIsAuthLoading] = useState(true);
	const [cartCount, setCartCount] = useState(0);
	const [orderCount, setOrderCount] = useState(0);

	// 4) [derived values / useMemo] ---------------------------------------
	const loginOn = !!user?.name;

	// 5) [handlers / useCallback] -----------------------------------------
	const logout = useCallback(async () => {
		console.log("로그아웃");
		setUser(initUser);
		setCartCount(0);
		setOrderCount(0);
		await postJson(getApiUrl(API_URL.AUTH_LOGOUT));

		// -- React Query 캐시 무효화
		// 로그인 회원 정보 초기화
		queryClient.setQueryData(["me"], initUser); // 직접 캐시 업데이트
		// 제품 카테고리 리스트 페이지 일 시 제품 카테고리 리스트 정보 갱신
		if (pathname.startsWith("/product/category/")) {
			queryClient.removeQueries({ queryKey: ["productList"] }); // 캐시 제거
		}
		// 제품 상세보기 페이지 일 시 제품상세 정보 갱신 (특히 위시 정보)
		if (pathname.startsWith("/product/detail/")) {
			queryClient.invalidateQueries({ queryKey: ["productDetail"] });
		}
	}, [queryClient, pathname]);

	// 7) [UI helper values] -------------------------------------------------
	// Provider value
	const value = useMemo(
		() => ({ loginOn, logout, user, setUser, isAuthLoading, setIsAuthLoading, cartCount, setCartCount, orderCount, setOrderCount }),
		[loginOn, logout, user, isAuthLoading, cartCount, orderCount],
	);

	return <authContext.Provider value={value}>{children}</authContext.Provider>;
};
