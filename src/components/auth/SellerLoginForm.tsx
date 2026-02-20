import API_URL from "@/api/endpoints";
import { CommonLoginForm } from "./CommonLoginForm";
import { getApiUrl } from "@/lib/getBaseUrl";

export const SellerLoginForm = () => {
	return <CommonLoginForm apiUrl={getApiUrl(API_URL.SELLER)} redirectTo="/seller/dashboard" invalidateKeys={["seller"]} loginIdField="sellerId" />;
};
