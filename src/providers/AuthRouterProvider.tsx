"use client";

import { usePathname } from "next/navigation";
import AuthProvider from "@/providers/auth/AuthProvider";
import SellerProvider from "@/providers/auth/SellerProvider";
import AdminProvider from "@/providers/auth/AdminProvider";

export default function AuthRouterProvider({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	if (pathname.startsWith("/seller")) {
		return <SellerProvider>{children}</SellerProvider>;
	}

	if (pathname.startsWith("/admin")) {
		return <AdminProvider>{children}</AdminProvider>;
	}

	return <AuthProvider>{children}</AuthProvider>;
}
