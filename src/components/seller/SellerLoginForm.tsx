import API_URL from "@/api/endpoints";
import { CommonLoginForm } from "../form/CommonLoginForm";
import { getApiUrl } from "@/lib/getBaseUrl";
import { Suspense } from "react";

export const SellerLoginForm = () => {
	return (
		<Suspense fallback={null}>
			<CommonLoginForm apiUrl={getApiUrl(API_URL.SELLER)} redirectTo="/seller" invalidateKeys={["sellerInfo"]} loginIdField="sellerId" />
		</Suspense>
	);
};
