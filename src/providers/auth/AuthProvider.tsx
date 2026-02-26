import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { authContext } from "@/context/authContext";
import { getApiUrl } from "@/lib/getBaseUrl";
import { UserInfo } from "@/types/auth";
import { isAuthRequiredPath } from "@/utils/auth";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

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

	const loginOn = !!user?.name;

	const logout = async () => {
		console.log("로그아웃");
		setUser(initUser);
		// React Query 캐시 무효화
		queryClient.setQueryData(["me"], initUser); // 직접 캐시 업데이트
		await postJson(getApiUrl(API_URL.AUTH_LOGOUT));
	};

	return <authContext.Provider value={{ loginOn, logout, user, setUser }}>{children}</authContext.Provider>;
};
