import { authContext } from "@/hooks/context/authContext";
import { useContext } from "react";

export function useAuth() {
	const context = useContext(authContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
