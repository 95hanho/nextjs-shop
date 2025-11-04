"use client";

import { Menu } from "@/types/main";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";

export default function Nav({ menuList }: { menuList: Menu[] }) {
	const maleMenuList = menuList.filter((menu) => menu.gender === "M");
	const femaleMenuList = menuList.filter((menu) => menu.gender === "F");

	const [activeGender, setActiveGender] = useState<string>("F");
	const showMenuList = useMemo(() => (activeGender === "M" ? maleMenuList : femaleMenuList), [activeGender]);

	// menu-wrap
	const [showMenu, setShowMenu] = useState<boolean>(false);
	const clickMenuLink = () => {
		setShowMenu(false);
	};

	useEffect(() => {
		// 클라이언트에서만 실행되는 코드
	}, []);

	return (
		<nav id="nav" onMouseLeave={() => setShowMenu(false)}>
			<div className="nav-wrap">
				<div className="gender-container" onMouseEnter={() => setShowMenu(true)}>
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
								const overMenuCount = menu.menuSubList.length > 10;
								return (
									<li key={"menu" + menu.menuTopId} className={`menu-list-li${overMenuCount ? " over" : ""}`}>
										<div>
											<Link href={`/product/category/${menu.menuTopId}/1`} onClick={clickMenuLink}>
												{menu.menuName}
											</Link>
										</div>
										{menu.menuSubList.map((subMenu) => (
											<div key={"subMenu" + subMenu.menuSubId} className="sub-menu-list">
												<Link href={`/product/category/${menu.menuTopId}/${subMenu.menuSubId}`} onClick={clickMenuLink}>
													{subMenu.menuName}
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
