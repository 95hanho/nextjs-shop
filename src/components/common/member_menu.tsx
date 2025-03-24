"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiUser } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion"; // framer-motion을 import 합니다.

export default function MemberMenu() {
	const [isOpen, set_isOpen] = useState(false);

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
									<Link href="/member">로그인</Link>
								</li>
								<li>
									<Link href="/order-history">주문/배송내역</Link>
								</li>
								<li>
									<Link href="/write-review">리뷰작성</Link>
								</li>
							</ul>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</button>
	);
}
