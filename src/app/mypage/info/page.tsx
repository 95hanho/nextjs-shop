import { useState } from "react";
import InfoPwdCheck from "./InfoPwdCheck";
import InfoUpdate from "./InfoUpdate";

/* 마이페이지 - 내정보보기 및 수정 */
export default function MyPageInfo() {
	return (
		<main id="myPageInfo" className="user-info">
			<InfoPwdCheck />

			{/* <InfoUpdate /> */}
		</main>
	);
}
