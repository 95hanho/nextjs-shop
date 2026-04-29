import { Menu } from "@/types/main";
import clsx from "clsx";
import Link from "next/link";
import styles from "./MenuButton.module.scss";
import { useMemo, useState } from "react";

interface MenuButtonProps {
	menuList: Menu[];
}

export const MenuButton = ({ menuList }: MenuButtonProps) => {
	// 2) [useState / useRef] ----------------------------------------------
	const [activeGender, setActiveGender] = useState<string>("M");
	const [showMenu, setShowMenu] = useState<boolean>(false);

	// 4) [derived values / useMemo] ---------------------------------------
	const maleMenuList = menuList.filter((menu) => menu.gender === "M");
	const femaleMenuList = menuList.filter((menu) => menu.gender === "F");
	const showMenuList = useMemo(() => (activeGender === "M" ? maleMenuList : femaleMenuList), [activeGender, maleMenuList, femaleMenuList]);

	return (
		<div className="relative flex items-center ml-4" onMouseLeave={() => setShowMenu(false)} onMouseEnter={() => setShowMenu(true)}>
			{["M", "F"].map((gender) => (
				<button
					key={"menu-gender-" + gender}
					className={clsx(styles.genderBtn, `${activeGender === gender ? "active" : ""}`)}
					onClick={() => {
						if (activeGender !== gender) {
							setActiveGender(gender);
							setShowMenu(true); // 성별 변경 시 메뉴 보이도록 설정
						} else setShowMenu((prev) => !prev);
					}}
				>
					{gender === "M" ? "남자" : "여자"}
				</button>
			))}
			{showMenu && (
				<div className={clsx("-ml-4 absolute bg-white z-[100] shadow-md top-8", styles.menuList)}>
					<div className="mb-4 ml-10 mr-6">
						<ul className={styles.menuListUi}>
							{showMenuList.map((menu) => {
								const overMenuCount = menu.menuSubList.length > 10;
								return (
									<li key={"menu" + menu.menuTopId} className={clsx(styles.menuListLi, `${overMenuCount ? " over" : ""}`)}>
										<div>
											<Link href={`/product/category/${menu.menuTopId}/1`} onClick={() => setShowMenu(false)}>
												{menu.menuName}
											</Link>
										</div>
										{menu.menuSubList.map((subMenu) => (
											<div key={"subMenu" + subMenu.menuSubId} className={styles.subMenuList}>
												{subMenu.productCount === 0 ? (
													<span className={styles.off}>{subMenu.menuName}</span>
												) : (
													<Link
														className={clsx("text-lg hover:underline", styles.subMenuLink)}
														href={`/product/category/${menu.menuTopId}/${subMenu.menuSubId}`}
														onClick={() => setShowMenu(false)}
													>
														{subMenu.menuName}({subMenu.productCount})
													</Link>
												)}
											</div>
										))}
									</li>
								);
							})}
						</ul>
					</div>
				</div>
			)}
		</div>
	);
};
