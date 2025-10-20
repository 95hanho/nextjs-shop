"use client";

import { Menu } from "@/types/main";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Nav({ menuList }: { menuList: Menu[] }) {
	const [activeGender, setActiveGender] = useState<string>("F");
	const maleMenuList = menuList.filter((menu) => menu.gender === "M");
	const femaleMenuList = menuList.filter((menu) => menu.gender === "F");

	const showMenuList = activeGender === "M" ? maleMenuList : femaleMenuList;

	// menu-wrap
	const [showMenu, set_showMenu] = useState<boolean>(false);
	const clickMenuLink = () => {
		set_showMenu(false);
	};

	useEffect(() => {
		// 클라이언트에서만 실행되는 코드
	}, []);

	return (
		<nav id="nav" onMouseLeave={() => set_showMenu(false)}>
			<div className="nav-wrap">
				<div className="gender-container" onMouseEnter={() => set_showMenu(true)}>
					<button
						className={`gender-btn ${activeGender === "M" ? "active" : ""}`}
						onClick={() => {
							setActiveGender("M");
						}}
					>
						남자
					</button>
					<button className={`gender-btn ${activeGender === "F" ? "active" : ""}`} onClick={() => setActiveGender("F")}>
						여자
					</button>
				</div>
				<div className="nav-menu">
					<a href="#">NEW</a>
					<a href="#">BEST</a>
					<a href="#">KIDS</a>
					<a href="#">EVENT</a>
				</div>
			</div>
			{showMenu && (
				<div className="menu-wrap">
					<div className="menu-list">
						<ul className="menu-list-ul">
							{showMenuList.map((menu) => {
								const overMenuCount = menu.subMenus.length > 10;
								return (
									<li key={"menu" + menu.menu_top_id} className={`menu-list-li${overMenuCount ? " over" : ""}`}>
										<div>
											<Link href={`/product/category/${menu.menu_top_id}/1`} onClick={clickMenuLink}>
												{menu.menu_name}
											</Link>
										</div>
										{menu.subMenus.map((subMenu) => (
											<div key={"subMenu" + subMenu.menu_sub_id} className="sub-menu-list">
												<Link href={`/product/category/${menu.menu_top_id}/${subMenu.menu_sub_id}`} onClick={clickMenuLink}>
													{subMenu.menu_name}
												</Link>
											</div>
										))}
									</li>
								);
							})}
						</ul>
					</div>
				</div>
			)}
		</nav>
	);
}
