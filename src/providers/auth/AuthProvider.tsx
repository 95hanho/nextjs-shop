import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { authContext } from "@/context/authContext";
import { getApiUrl } from "@/lib/getBaseUrl";
import { UserInfo } from "@/types/auth";
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
	const [user, setUser] = useState<UserInfo>(initUser);

	const loginOn = !!user;

	const logout = async () => {
		console.log("로그아웃");
		setUser(initUser);
		await postJson(getApiUrl(API_URL.AUTH_LOGOUT));
		location.reload();
	};

	return <authContext.Provider value={{ loginOn, logout, user, setUser }}>{children}</authContext.Provider>;
};
