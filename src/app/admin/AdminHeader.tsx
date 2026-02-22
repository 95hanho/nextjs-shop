"use client";

import styles from "@/app/Header.module.scss"; // 공통 스타일 import
import { FiUser } from "react-icons/fi";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { HeaderMenu } from "@/components/common/HeaderMenu";
import { useGetAdminInfo } from "@/hooks/query/admin/useGetAdminInfo";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function AdminHeader() {
	const { data: admin } = useGetAdminInfo();
	const headerRef = useRef<HTMLInputElement | null>(null);
	const [isOpen, set_isOpen] = useState<boolean>(false);
	const { logout } = useAdminAuth();

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
				<Link href={"/admin"} className="text-3xl">
					관리자
				</Link>
			</h1>
			<div className="absolute flex items-center right-5">
				<div className={styles.headerBtn}>
					{admin?.adminName && `${admin.adminName}님 (관리자)`}
					<button onClick={() => set_isOpen(!isOpen)}>
						<FiUser />
						<HeaderMenu
							isOpen={isOpen}
							nodes={[
								<Link key="info" href="/admin/mypage/info" prefetch>
									내정보
								</Link>,
								<>
									{!admin?.adminName ? (
										<Link key="login" href="/admin/login" prefetch>
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
