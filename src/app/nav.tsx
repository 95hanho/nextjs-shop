"use client";

import { useState, useEffect } from "react";

export default function Nav() {
	const [activeGender, setActiveGender] = useState("여자");

	useEffect(() => {
		// 클라이언트에서만 실행되는 코드
		setActiveGender("여자");
	}, []);

	return (
		<nav id="nav">
			<div className="gender-container">
				<button
					className={`gender-btn ${activeGender === "남자" ? "active" : ""}`}
					onClick={() => setActiveGender("남자")}
				>
					남자
				</button>
				<button
					className={`gender-btn ${activeGender === "여자" ? "active" : ""}`}
					onClick={() => setActiveGender("여자")}
				>
					여자
				</button>
			</div>
			<div className="nav-menu">
				<a href="#">NEW</a>
				<a href="#">BEST</a>
				<a href="#">KIDS</a>
				<a href="#">EVENT</a>
			</div>
		</nav>
	);
}
