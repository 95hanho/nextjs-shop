"use client";

import { usePathname } from "next/navigation";
import { Menu } from "@/types/main";
import AdminHeader from "@/app/admin/AdminHeader";
import SellerHeader from "@/app/seller/SellerHeader";
import Header from "@/app/Header";

interface DynamicHeaderProps {
	menuList: Menu[];
}

export default function DynamicHeader({ menuList }: DynamicHeaderProps) {
	const pathname = usePathname();

	if (pathname.startsWith("/seller")) {
		return <SellerHeader />;
	}

	if (pathname.startsWith("/admin")) {
		return <AdminHeader />;
	}

	if (!pathname.startsWith("/seller") && !pathname.startsWith("/admin")) {
		return <Header menuList={menuList} />;
	}
}
