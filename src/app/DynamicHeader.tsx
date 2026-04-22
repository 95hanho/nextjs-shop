"use client";

import { usePathname } from "next/navigation";
import { Menu } from "@/types/main";
import Header from "@/app/Header";

interface DynamicHeaderProps {
	menuList: Menu[];
}

export default function DynamicHeader({ menuList }: DynamicHeaderProps) {
	// 1) [store / custom hooks] -------------------------------------------
	const pathname = usePathname();

	if (!pathname.startsWith("/seller") && !pathname.startsWith("/admin")) {
		return <Header menuList={menuList} />;
	}
}
