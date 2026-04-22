"use client";

import Link from "next/link";
import styles from "./SellerMain.module.scss";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useSellerAuth } from "@/hooks/useSellerAuth";

export default function SellerNav() {
	// 1) [store / custom hooks] -------------------------------------------
	const pathname = usePathname();
	const { seller } = useSellerAuth();

	if (!seller.sellerName) return null; // 판매자 정보 없으면 네비 안보이게 (예: 로그인 페이지)
	return (
		<nav className={styles.sellerNav}>
			<ul className="flex gap-4 mb-5 border-b">
				<li>
					<Link href="/seller" className={clsx("block py-2", { [styles.active]: pathname === "/seller" })}>
						메인
					</Link>
				</li>
				<li>
					<Link href="/seller/coupon" className={clsx("block py-2", { [styles.active]: pathname === "/seller/coupon" })}>
						쿠폰배포
					</Link>
				</li>
				<li>
					<Link href="/seller/products" className={clsx("block py-2", { [styles.active]: pathname === "/seller/products" })}>
						판매목록
					</Link>
				</li>
			</ul>
		</nav>
	);
}
