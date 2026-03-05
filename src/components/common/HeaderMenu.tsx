"use client";

import styles from "./UserMenu.module.scss";
import React, { useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // framer-motion을 import 합니다.

interface HeaderMenuProps {
	isOpen: boolean;
	nodes?: React.ReactNode[];
}

export const HeaderMenu = ({ isOpen, nodes }: HeaderMenuProps) => {
	const menuRef = useRef<HTMLDivElement | null>(null);
	const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

	useLayoutEffect(() => {
		if (!isOpen || !menuRef.current) {
			setMenuStyle({});
			return;
		}

		const rect = menuRef.current.getBoundingClientRect();
		const overflowRight = rect.right > window.innerWidth - 5;

		if (overflowRight) {
			setMenuStyle({ right: -10, left: "auto" });
		} else {
			setMenuStyle({});
		}
	}, [isOpen, nodes]);

	return (
		<AnimatePresence>
			{isOpen && nodes && (
				<motion.div
					ref={menuRef}
					className={styles.userMenu}
					style={menuStyle}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
				>
					<div className={styles.popupMenu}>
						<ul>
							{nodes?.map((node, index) => (
								<li key={"headerMenu" + index}>{node}</li>
							))}
						</ul>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
