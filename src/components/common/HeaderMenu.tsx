import styles from "./UserMenu.module.scss";
import React from "react";
import { motion, AnimatePresence } from "framer-motion"; // framer-motion을 import 합니다.

interface HeaderMenuProps {
	isOpen: boolean;
	nodes?: React.ReactNode[];
}

export const HeaderMenu = ({ isOpen, nodes }: HeaderMenuProps) => {
	return (
		<AnimatePresence>
			{isOpen && nodes && (
				<motion.div
					className={styles.userMenu}
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
