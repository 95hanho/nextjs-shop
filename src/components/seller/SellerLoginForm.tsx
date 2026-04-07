import API_URL from "@/api/endpoints";
import { CommonLoginForm } from "../form/CommonLoginForm";
import { getApiUrl } from "@/lib/getBaseUrl";

export const SellerLoginForm = () => {
	return <CommonLoginForm apiUrl={getApiUrl(API_URL.SELLER)} redirectTo="/seller" invalidateKeys={["sellerInfo"]} loginIdField="sellerId" />;
};
