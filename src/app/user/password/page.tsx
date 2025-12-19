/* 비밀번호 변경페이지 */
import { cookies } from "next/headers";
import PasswordChangeClient from "./PasswordChangeClient";
import { redirect } from "next/navigation";

export default function PasswordChangePage() {
	const cookieStore = cookies();

	const hasRefresh = cookieStore.get("refreshToken")?.value;
	const hasReset = cookieStore.get("pwdResetToken")?.value; // 비번찾기 인증 후 잠시 발급된 토큰(추천: HttpOnly)

	// 둘 중 하나도 없으면 진입 불가
	if (!hasRefresh && !hasReset) {
		redirect("/user"); // 또는 /find-password
	}

	return <PasswordChangeClient mode={hasRefresh ? "LOGGED_IN" : "RESET"} />;
}
