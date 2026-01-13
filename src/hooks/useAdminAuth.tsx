"use client";

import { adminAuthContext } from "@/context/authContext";
import { useContext } from "react";

export default function useAdminAuth() {
	const context = useContext(adminAuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AdminProvider");
	}
	return context;
}
