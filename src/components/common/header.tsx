"use client";

import { FiHeart, FiShoppingCart } from "react-icons/fi";
import MemberMenu from "./Member_menu";
import Nav from "./Nav";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";
import { isTokenExpired } from "@/utils/auth";

export default function Header() {
  const { accessToken, tokenCheck } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
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
              <Link href={"/mypage/wish"}>
                <FiHeart />
              </Link>
              <Link href={"/mypage/cart"}>
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
