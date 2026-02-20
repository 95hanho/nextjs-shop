import API_URL from "@/api/endpoints";
import { CommonLoginForm } from "./CommonLoginForm";
import { getApiUrl } from "@/lib/getBaseUrl";

export const AdminLoginForm = () => {
	return <CommonLoginForm apiUrl={getApiUrl(API_URL.ADMIN)} redirectTo="/admin" invalidateKeys={["admin"]} loginIdField="adminId" />;
};
