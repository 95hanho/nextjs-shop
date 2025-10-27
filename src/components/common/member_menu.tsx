"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiUser } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion"; // framer-motion을 import 합니다.
import useAuth from "@/hooks/useAuth";

export default function MemberMenu() {
	const { loginOn, logout } = useAuth();
	const [isOpen, set_isOpen] = useState<boolean>(false);

	const menuMouseleave = () => {
		set_isOpen(false);
	};

	useEffect(() => {
		if (isOpen) {
			document.getElementById("header")?.addEventListener("mouseleave", menuMouseleave);
		} else document.getElementById("header")?.removeEventListener("mouseleave", menuMouseleave);
	}, [isOpen]);

	return (
		<button onClick={() => set_isOpen(!isOpen)}>
			<FiUser />
			<AnimatePresence>
				{isOpen && (
					<motion.div
						className="member-menu"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
					>
						<div className="popup-menu">
							<ul>
								<li>
									<Link href="/mypage/info" prefetch>
										내정보
									</Link>
								</li>
								<li>{!loginOn ? <Link href="/member">로그인</Link> : <div onClick={logout}>로그아웃</div>}</li>
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
		</button>
	);
}
