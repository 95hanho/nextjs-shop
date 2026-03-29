import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { authContext } from "@/context/authContext";
import { getApiUrl } from "@/lib/getBaseUrl";
import { UserInfo } from "@/types/auth";
import { useQueryClient } from "@tanstack/react-query";
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
	const queryClient = useQueryClient();
	const [user, setUser] = useState<UserInfo>(initUser);
	const [isAuthLoading, setIsAuthLoading] = useState(true);
	const [cartCount, setCartCount] = useState(0);
	const [orderCount, setOrderCount] = useState(0);

	const loginOn = !!user?.name;

	const logout = useCallback(async () => {
		console.log("로그아웃");
		setUser(initUser);
		// React Query 캐시 무효화
		queryClient.setQueryData(["me"], initUser); // 직접 캐시 업데이트
		await postJson(getApiUrl(API_URL.AUTH_LOGOUT));
	}, [queryClient]);

	// value ---------------------------------------
	const value = useMemo(
		() => ({ loginOn, logout, user, setUser, isAuthLoading, setIsAuthLoading, cartCount, setCartCount, orderCount, setOrderCount }),
		[loginOn, logout, user, isAuthLoading, cartCount, orderCount],
	);

	return <authContext.Provider value={value}>{children}</authContext.Provider>;
};
