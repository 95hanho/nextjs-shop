import API_URL from "@/api/endpoints";
import { CommonLoginForm } from "./CommonLoginForm";
import { getApiUrl } from "@/lib/getBaseUrl";

export const LoginForm = () => {
	return <CommonLoginForm apiUrl={getApiUrl(API_URL.AUTH)} redirectTo="/" invalidateKeys={["me"]} />;
};
