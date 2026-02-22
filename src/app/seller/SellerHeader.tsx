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
								<Link key="info" href="/seller/mypage/info" prefetch>
									내정보
								</Link>,
								<>
									{!seller?.sellerName ? (
										<Link key="login" href="/seller/login" prefetch>
											로그인
										</Link>
									) : (
										<div key="logout" onClick={logout}>
											로그아웃
										</div>
									)}
								</>,
							]}
						/>
					</button>
				</div>
			</div>
		</header>
	);
}
