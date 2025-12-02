"use client";

import { FiShoppingCart, FiStar } from "react-icons/fi";
import { usePathname } from "next/navigation";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";
import { Menu } from "@/types/main";
import UserMenu from "./UserMenu";
import Nav from "./Nav";
import { useGetUserInfo } from "@/hooks/query/auth/useGetUserInfo";

interface HeaderProps {
	menuList: Menu[];
}

export default function Header({ menuList }: HeaderProps) {
	const pathname = usePathname();

	useEffect(() => {
		// console.log("페이지 바껴서 토큰체크 실행됨");
		// tokenCheck();
	}, [pathname]);

	if (!pathname?.startsWith("/user")) {
		return (
			<>
				<header id="header">
					<h1>
						<Link href={"/"}>NEXTJS-SHOP</Link>
					</h1>
					<div className="header-wrap">
						<div className="header-btn">
							<UserMenu />
							<Link href={"/mypage/wish"} prefetch>
								<FiStar />
							</Link>
							<Link href={"/mypage/cart"} prefetch>
								<FiShoppingCart />
							</Link>
						</div>
					</div>
				</header>
				<Nav menuList={menuList} />
			</>
		);
	}
}
