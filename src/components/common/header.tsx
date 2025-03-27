"use client";

import { FiHeart, FiShoppingCart } from "react-icons/fi";
import MemberMenu from "./Member_menu";
import Nav from "./Nav";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
	const path = usePathname();

	if (!path?.startsWith("/member")) {
		return (
			<>
				<header id="header">
					<h1>NEXTJS-SHOP</h1>
					<div className="header-wrap">
						<div className="header-btn">
							<MemberMenu />
							<button>
								<FiHeart />
							</button>
							<button>
								<FiShoppingCart />
							</button>
						</div>
					</div>
				</header>
				<Nav />
			</>
		);
	}
}
