import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { sellerAuthContext } from "@/context/authContext";
import { getApiUrl } from "@/lib/getBaseUrl";
import { SellerInfo } from "@/types/seller";
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
	const [seller, setSeller] = useState<SellerInfo>(initSeller);

	const loginOn = !!seller;

	const logout = async () => {
		console.log("로그아웃");
		setSeller(initSeller);
		await postJson(getApiUrl(API_URL.SELLER_LOGOUT));
		location.reload();
	};

	return <sellerAuthContext.Provider value={{ loginOn, logout, seller, setSeller }}>{children}</sellerAuthContext.Provider>;
};
