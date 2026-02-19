import { CommonLoginForm } from "./CommonLoginForm";

export const SellerLoginForm = () => {
	return <CommonLoginForm apiUrl="/api/seller/login" redirectTo="/seller/dashboard" invalidateKeys={["seller"]} loginIdField="sellerId" />;
};
