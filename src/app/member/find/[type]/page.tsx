"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function FindMember() {
	const params = useParams<{ type?: string }>(); // `type`이 있을 수도 있고 없을 수도 있음
	const router = useRouter();
	const [id, set_id] = useState<string>("");
	const [phone, set_phone] = useState<string>("");

	useEffect(() => {
		const type = params?.type ?? "";
		if (!["id", "password"].includes(type)) {
			router.push("/member");
		}
	}, []);

	return (
		<div id="login" className="member-wrapper">
			<div className="form-wrap">
				<h3>
					<Link href={"/"}>NextJS-SHOP</Link>
				</h3>
				<h2>
					{params?.type == "id" ? "아이디" : ""}
					{params?.type == "password" ? "비밀번호" : ""}찾기
				</h2>
				<form action="">
					{params?.type == "password" && (
						<div className="find-input">
							<label>아이디 : </label>
							<input type="text" value={id} onChange={(e) => set_id(e.target.value)} />
						</div>
					)}
					<div className="find-input">
						<label>휴대폰번호 : </label>
						<input type="text" value={phone} onChange={(e) => set_phone(e.target.value)} />
						<button>인증번호받기</button>
					</div>
					<div className="find-input">
						<label>인증번호 : </label>
						<input type="text" />
					</div>
					{/* {alertMessage && <p>* {alertMessage}</p>} */}
				</form>
				<div className="find-wrap">
					<Link href={"/member"}>로그인</Link>
					{params?.type == "id" && <Link href={"/member/find/password"}>비밀번호찾기</Link>}
					{params?.type == "password" && <Link href={"/member/find/id"}>아이디찾기</Link>}
					<Link href={"/member/join"}>회원가입</Link>
				</div>
			</div>
		</div>
	);
}
