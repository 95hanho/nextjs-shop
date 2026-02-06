import { sellerAuthContext } from "@/context/authContext";
import { useContext } from "react";

export function useSellerAuth() {
	const context = useContext(sellerAuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an SellerProvider");
	}
	return context;
}
