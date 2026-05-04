"use client";

import { usePathname } from "next/navigation";
import { Menu } from "@/types/main";
import Header from "@/app/Header";
import { Suspense } from "react";

interface DynamicHeaderProps {
	menuList: Menu[];
}

export default function DynamicHeader({ menuList }: DynamicHeaderProps) {
	// 1) [store / custom hooks] -------------------------------------------
	const pathname = usePathname();

	if (!pathname.startsWith("/seller") && !pathname.startsWith("/admin")) {
		return (
			<Suspense fallback={null}>
				<Header menuList={menuList} />
			</Suspense>
		);
	}
}
