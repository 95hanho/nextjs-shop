import API_URL from "@/api/endpoints";
import { CommonLoginForm } from "../form/CommonLoginForm";
import { getApiUrl } from "@/lib/getBaseUrl";
import { Suspense } from "react";

export const AdminLoginForm = () => {
	return (
		<Suspense fallback={null}>
			<CommonLoginForm apiUrl={getApiUrl(API_URL.ADMIN)} redirectTo="/admin/login" invalidateKeys={["adminInfo"]} loginIdField="adminId" />
		</Suspense>
	);
};
