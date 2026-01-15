"use client";

import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { authContext } from "@/context/authContext";
import { getApiUrl } from "@/lib/getBaseUrl";
import { UserInfo } from "@/types/auth";
import { useState } from "react";

interface AuthProviderProps {
	children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
	const [loginOn, setLoginOn] = useState<boolean>(false);
	const [user, setUser] = useState<UserInfo | null>(null);

	const logout = async () => {
		console.log("로그아웃");
		setLoginOn(false);
		setUser(null);
		await postJson(getApiUrl(API_URL.AUTH_LOGOUT));
		location.reload();
	};

	return <authContext.Provider value={{ loginOn, logout, user, setUser }}>{children}</authContext.Provider>;
}
