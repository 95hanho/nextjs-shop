"use client";

import { FiHeart, FiShoppingCart } from "react-icons/fi";
import MemberMenu from "./Member_menu";
import Nav from "./Nav";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { useContext, useEffect } from "react";
import { isTokenExpired } from "@/utils/auth";
import { authContext } from "@/context/AuthProvider";

export default function Header() {
	const { tokenCheck } = useAuth();
	const pathname = usePathname();

	useEffect(() => {
		console.log("페이지 바껴서 토큰체크 실행됨");
		tokenCheck();
	}, [pathname]);

	if (!pathname?.startsWith("/member")) {
		return (
			<>
				<header id="header">
					<h1>
						<Link href={"/"}>NEXTJS-SHOP</Link>
					</h1>
					<div className="header-wrap">
						<div className="header-btn">
							<MemberMenu />
							<Link href={"/mypage/wish"} prefetch>
								<FiHeart />
							</Link>
							<Link href={"/mypage/cart"} prefetch>
								<FiShoppingCart />
							</Link>
						</div>
					</div>
				</header>
				<Nav />
			</>
		);
	}
}
