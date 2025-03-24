import Link from "next/link";

export default function Login() {
	return (
		<div
			id="login"
			style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
		>
			<div>
				<h2>로그인</h2>
				<form action="">
					<div>
						아이디 : <input type="text" />
					</div>
					<div>
						비밀번호 : <input type="password" />
					</div>
					<div>
						<button type="submit">로그인</button>
					</div>
				</form>
				<div>
					<Link href={"/member/join"}>회원가입</Link>
					<Link href={""}>아이디 찾기</Link>
					<Link href={""}>비밀번호 찾기</Link>
				</div>
			</div>
		</div>
	);
}
