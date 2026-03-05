"use client";

import styles from "@/app/Header.module.scss"; // 공통 스타일 import
import { FiUser } from "react-icons/fi";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { HeaderMenu } from "@/components/common/HeaderMenu";
import { useGetSellerInfo } from "@/hooks/query/seller/useGetSellerInfo";
import { useSellerAuth } from "@/hooks/useSellerAuth";

export default function SellerHeader() {
	const { data: seller } = useGetSellerInfo();
	const headerRef = useRef<HTMLInputElement | null>(null);
	const [isOpen, set_isOpen] = useState<boolean>(false);
	const { logout } = useSellerAuth();

	const menuMouseleave = () => {
		set_isOpen(false);
	};

	useEffect(() => {
		if (isOpen) {
			setTimeout(() => {
				headerRef.current?.addEventListener("mouseleave", menuMouseleave);
			}, 300);
		} else headerRef.current?.removeEventListener("mouseleave", menuMouseleave);
	}, [isOpen]);

	if (!seller?.sellerName) return null; // 판매자 정보 없으면 헤더 안보이게 (예: 로그인 페이지)
	return (
		<header ref={headerRef} className="flex items-center justify-center py-5 bg-slate-50 z-[1000] h-12 sticky top-0">
			<h1 className={styles.title}>
				<Link href={"/seller"} className="text-3xl">
					판매자 관리
				</Link>
			</h1>
			<div className="absolute flex items-center right-5">
				<div className={styles.headerBtn}>
					{seller?.sellerName && `${seller.sellerName}님 (판매자)`}
					<button onClick={() => set_isOpen(!isOpen)}>
						<FiUser />
						<HeaderMenu
							isOpen={isOpen}
							nodes={[
								<Link key="info" href="/seller/info" prefetch={false}>
									내정보
								</Link>,
								<a key="logout" onClick={logout}>
									로그아웃
								</a>,
							]}
						/>
					</button>
				</div>
			</div>
		</header>
	);
}
