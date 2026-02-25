"use client";

import styles from "./Header.module.scss";
import { FiShoppingCart, FiStar, FiUser } from "react-icons/fi";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu } from "@/types/main";
import { HeaderMenu } from "../components/common/HeaderMenu";
import { Nav } from "../components/common/Nav";
import { useAuth } from "@/hooks/useAuth";
import { useGetUserInfo } from "@/hooks/query/auth/useGetUserInfo";

interface HeaderProps {
	menuList: Menu[];
}

export default function Header({ menuList }: HeaderProps) {
	const pathname = usePathname();
	const { data: user } = useGetUserInfo();
	const { logout } = useAuth();

	const headerRef = useRef<HTMLInputElement | null>(null);
	const [isOpen, set_isOpen] = useState<boolean>(false);

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

	useEffect(() => {
		// console.log("페이지 바껴서 토큰체크 실행됨");
		// tokenCheck();
	}, [pathname]);

	return (
		<>
			<header ref={headerRef} className="flex items-center justify-center py-5 bg-slate-50 z-[1000] h-12 sticky top-0">
				<h1 className={styles.title}>
					<Link href={"/"} className="text-3xl" prefetch={false}>
						NEXTJS-SHOP
					</Link>
				</h1>
				<div className="absolute flex items-center right-5">
					<div className={styles.headerBtn}>
						{user.name && `${user.name}님`}
						<button onClick={() => set_isOpen(!isOpen)}>
							<FiUser />
							<HeaderMenu
								isOpen={isOpen}
								nodes={[
									<Link key="info" href="/mypage/info" prefetch={false}>
										내정보
									</Link>,
									<>
										{!user.name ? (
											<Link key="login" href="/user" prefetch={false}>
												로그인
											</Link>
										) : (
											<div key="logout" onClick={logout}>
												로그아웃
											</div>
										)}
									</>,
									<Link key="order-history" href="/mypage/order-history" prefetch={false}>
										주문/배송내역
									</Link>,
								]}
							/>
						</button>
						<Link href={"/mypage/wish"} prefetch={false}>
							<FiStar />
						</Link>
						<Link href={"/mypage/cart"} prefetch={false}>
							<FiShoppingCart />
						</Link>
					</div>
				</div>
			</header>
			{!pathname?.startsWith("/user") && <Nav menuList={menuList} />}
		</>
	);
}
