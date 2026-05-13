"use client";

import { usePathname } from "next/navigation";
import Header from "@/app/Header";
import { Suspense } from "react";

export default function DynamicHeader() {
	// 1) [store / providers / custom hooks] -------------------------------------------
	const pathname = usePathname();

	if (!pathname.startsWith("/seller") && !pathname.startsWith("/admin")) {
		return (
			<Suspense fallback={null}>
				<Header />
			</Suspense>
		);
	}
}
