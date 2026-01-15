"use client";

import { sellerAuthContext } from "@/context/authContext";
import { useContext } from "react";

export default function useSellerAuth() {
	const context = useContext(sellerAuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an SellerProvider");
	}
	return context;
}
