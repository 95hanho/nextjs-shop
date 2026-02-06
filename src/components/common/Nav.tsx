import { Menu } from "@/types/main";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import styles from "./Nav.module.scss";

export const Nav = ({ menuList }: { menuList: Menu[] }) => {
	const maleMenuList = menuList.filter((menu) => menu.gender === "M");
	const femaleMenuList = menuList.filter((menu) => menu.gender === "F");

	const [activeGender, setActiveGender] = useState<string>("F");
	const showMenuList = useMemo(() => (activeGender === "M" ? maleMenuList : femaleMenuList), [activeGender, maleMenuList, femaleMenuList]);

	// menu-wrap
	const [showMenu, setShowMenu] = useState<boolean>(false);
	const clickMenuLink = () => {
		setShowMenu(false);
	};

	useEffect(() => {
		// 클라이언트에서만 실행되는 코드
	}, []);

	return (
		<nav id="nav" className="relative" onMouseLeave={() => setShowMenu(false)}>
			<div className="nav-wrap h-[50px] flex justify-between items-center py-5 bg-gray-100 min-w-[900px]">
				<div className="flex items-center ml-4" onMouseEnter={() => setShowMenu(true)}>
					{["M", "F"].map((gender) => (
						<button
							key={"menu-gender-" + gender}
							className={[styles.genderBtn, `${activeGender === gender ? "active" : ""}`].join(" ")}
							onClick={() => {
								setActiveGender(gender);
							}}
						>
							{gender === "M" ? "남자" : "여자"}
						</button>
					))}
				</div>
				<div className={[styles.navMenu, "absolute flex items-center content-center -translate-x-1/2 left-1/2"].join(" ")}>
					<a href="#">NEW</a>
					<a href="#">BEST</a>
					<a href="#">KIDS</a>
					<a href="#">EVENT</a>
				</div>
			</div>
			{showMenu && (
				<div className="absolute bg-white z-[1] shadow-md">
					<div className="mb-4 ml-10 mr-6">
						<ul className={[styles.menuListUi].join(" ")}>
							{showMenuList.map((menu) => {
								const overMenuCount = menu.menuSubList.length > 10;
								return (
									<li key={"menu" + menu.menuTopId} className={[styles.menuListLi, `${overMenuCount ? " over" : ""}`].join(" ")}>
										<div>
											<Link href={`/product/category/${menu.menuTopId}/1`} onClick={clickMenuLink}>
												{menu.menuName}
											</Link>
										</div>
										{menu.menuSubList.map((subMenu) => (
											<div key={"subMenu" + subMenu.menuSubId}>
												<Link
													className="text-lg hover:underline"
													href={`/product/category/${menu.menuTopId}/${subMenu.menuSubId}`}
													onClick={clickMenuLink}
												>
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
};
