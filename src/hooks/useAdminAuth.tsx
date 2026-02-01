"use client";

import { adminAuthContext } from "@/context/authContext";
import { useContext } from "react";

export function useAdminAuth() {
	const context = useContext(adminAuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AdminProvider");
	}
	return context;
}
