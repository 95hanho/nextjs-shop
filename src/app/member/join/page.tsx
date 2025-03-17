"use client";

import { useState } from "react";

export default function Member_join() {
	const [form, setForm] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setForm({
			...form,
			[name]: value,
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// 회원가입 로직 추가
		console.log(form);
	};

	return (
		<div>
			<h1>회원가입</h1>
			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="username">사용자 이름:</label>
					<input
						type="text"
						id="username"
						name="username"
						value={form.username}
						onChange={handleChange}
						required
					/>
				</div>
				<div>
					<label htmlFor="email">이메일:</label>
					<input
						type="email"
						id="email"
						name="email"
						value={form.email}
						onChange={handleChange}
						required
					/>
				</div>
				<div>
					<label htmlFor="password">비밀번호:</label>
					<input
						type="password"
						id="password"
						name="password"
						value={form.password}
						onChange={handleChange}
						required
					/>
				</div>
				<div>
					<label htmlFor="confirmPassword">비밀번호 확인:</label>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						value={form.confirmPassword}
						onChange={handleChange}
						required
					/>
				</div>
				<button type="submit">가입하기</button>
			</form>
		</div>
	);
}
