"use client";

import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { adminAuthContext } from "@/context/authContext";
import { getApiUrl } from "@/lib/getBaseUrl";
import { AdminInfo } from "@/types/admin";
import { useState } from "react";

interface SellerProviderProps {
	children: React.ReactNode;
}

export default function AdminProvider({ children }: SellerProviderProps) {
	const [loginOn, setLoginOn] = useState<boolean>(false);
	const [admin, setAdmin] = useState<AdminInfo | null>(null);

	const logout = async () => {
		console.log("로그아웃");
		setLoginOn(false);
		setAdmin(null);
		await postJson(getApiUrl(API_URL.SELLER_LOGOUT));
		location.reload();
	};

	return <adminAuthContext.Provider value={{ loginOn, logout, admin, setAdmin }}>{children}</adminAuthContext.Provider>;
}
