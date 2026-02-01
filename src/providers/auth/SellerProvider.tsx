"use client";

import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { sellerAuthContext } from "@/context/authContext";
import { getApiUrl } from "@/lib/getBaseUrl";
import { SellerInfo } from "@/types/seller";
import { useState } from "react";

interface SellerProviderProps {
	children: React.ReactNode;
}

export const SellerProvider = ({ children }: SellerProviderProps) => {
	const [loginOn, setLoginOn] = useState<boolean>(false);
	const [seller, setSeller] = useState<SellerInfo | null>(null);

	const logout = async () => {
		console.log("로그아웃");
		setLoginOn(false);
		setSeller(null);
		await postJson(getApiUrl(API_URL.SELLER_LOGOUT));
		location.reload();
	};

	return <sellerAuthContext.Provider value={{ loginOn, logout, seller, setSeller }}>{children}</sellerAuthContext.Provider>;
};
