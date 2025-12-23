import { useState } from "react";
import UserInfo from "./UserInfo";
import InfoUpdate from "./InfoUpdate";

/* 마이페이지 - 내정보보기 및 수정 */
export default function MyPageInfo() {
	return (
		<main id="myPageInfo" className="user-info">
			<UserInfo />

			{/* <InfoUpdate /> */}
		</main>
	);
}
