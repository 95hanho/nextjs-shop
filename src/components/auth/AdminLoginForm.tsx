import { CommonLoginForm } from "./CommonLoginForm";

export const AdminLoginForm = () => {
	return <CommonLoginForm apiUrl="/api/admin/login" redirectTo="/admin" invalidateKeys={["admin"]} loginIdField="adminId" />;
};
