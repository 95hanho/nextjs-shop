"use client";

import styles from "./UserMenu.module.scss";
import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion"; // framer-motion을 import 합니다.
import { useAuth } from "@/hooks/useAuth";
import { useGetUserInfo } from "@/hooks/query/auth/useGetUserInfo";

interface UserMenuProps {
	isOpen: boolean;
}

export const UserMenu = ({ isOpen }: UserMenuProps) => {
	const { data: user } = useGetUserInfo();
	const { logout } = useAuth();

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					className={styles.userMenu}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
				>
					<div className={styles.popupMenu}>
						<ul>
							<li>
								<Link href="/mypage/info" prefetch>
									내정보
								</Link>
							</li>
							<li>{!user ? <Link href="/user">로그인</Link> : <div onClick={logout}>로그아웃</div>}</li>
							<li>
								<Link href="/mypage/order-history" prefetch>
									주문/배송내역
								</Link>
							</li>
						</ul>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
