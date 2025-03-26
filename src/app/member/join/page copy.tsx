"use client";

import { ChangeEvent, FormEvent, JoinForm, JoinFormFocus, JoinFormRefs } from "@/types/form";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const init_joinForm: JoinForm = {
	id: "",
	password: "",
	password_check: "",
	name: "",
	zonecode: "",
	address: "",
	phone: "",
	email: "",
	birthday: "",
};
const init_joinFormFocus: JoinFormFocus = {
	id: false,
	password: false,
	password_check: false,
	name: false,
	zonecode: false,
	address: false,
	phone1: false,
	phone2: false,
	phone3: false,
	mobile1: false,
	mobile2: false,
	mobile3: false,
	email: false,
	birthday: false,
};

export default function Member_join() {
	const [joinForm, set_joinForm] = useState(init_joinForm);
	const joinFormRefs = useRef<Partial<JoinFormRefs>>({});
	const [joinFormFocus, set_joinFormFocus] = useState(init_joinFormFocus);

	const change_joinForm = (e: ChangeEvent) => {
		const { name, value } = e.target;
		set_joinForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const change_joinFormFocus = (field: keyof JoinForm, value: boolean) => {
		if (!joinForm[field]) {
			set_joinFormFocus((prev) => ({ ...prev, [field]: value }));
		}
	};

	const join_submit = (e: FormEvent) => {
		e.preventDefault();
		// 회원가입 로직 추가
		console.log(joinForm);
	};

	return (
		<div id="memberJoin" className="member-wrapper">
			<div className="form-wrap join">
				<h2>
					<Link href={"/"}>NextJS-SHOP</Link>
				</h2>

				<form onSubmit={join_submit}>
					<div className="join-input">
						<div className="join-label">
							<label htmlFor="">아이디</label>
							{/* <span className="c_red">*</span> */}
						</div>
						<div className="join-text">
							<div>
								<input
									type="text"
									placeholder="아이디를 입력해주세요."
									name="id"
									value={joinForm.id}
									onChange={change_joinForm}
								/>
							</div>
							{/* <p className="c_red">
								* <span>dasfsfsdafasd</span>
							</p> */}
						</div>
					</div>
					<div className="join-input">
						<div className="join-label">
							<label htmlFor="">비밀번호</label>
							{/* <span className="c_red">*</span> */}
						</div>
						<div className="join-text">
							<div>
								<input
									type="text"
									placeholder="비밀번호를 입력해주세요."
									name="password"
									value={joinForm.password}
									onChange={change_joinForm}
								/>
							</div>
							{/* <p className="c_red">
								* <span>dasfsfsdafasd</span>
							</p> */}
						</div>
					</div>
					<div className="join-input">
						<div className="join-label">
							<label htmlFor="">비밀번호 확인</label>
							{/* <span className="c_red">*</span> */}
						</div>
						<div className="join-text">
							<div>
								<input
									type="text"
									placeholder="비밀번호를 한 번 더 입력해주세요."
									name="password"
									value={joinForm.password}
									onChange={change_joinForm}
								/>
							</div>
							{/* <p className="c_red">
								* <span>dasfsfsdafasd</span>
							</p> */}
						</div>
					</div>
					<div className="join-space"></div>
					<div className="join-input">
						<div className="join-label">
							<label htmlFor="">이름</label>
							{/* <span className="c_red">*</span> */}
						</div>
						<div className="join-text">
							<div>
								<input
									type="text"
									placeholder="이름을 입력해주세요."
									name="name"
									value={joinForm.name}
									onChange={change_joinForm}
								/>
							</div>
							{/* <p className="c_red">
								* <span>dasfsfsdafasd</span>
							</p> */}
						</div>
					</div>
					<div className="join-input">
						<div className="join-label">
							<label htmlFor="">주소</label>
							{/* <span className="c_red">*</span> */}
						</div>
						<div className="join-text">
							<div>
								<input
									type="text"
									placeholder="주소를 입력해주세요."
									name="zonecode"
									value={joinForm.zonecode}
									readOnly
								/>
								<button className="search-btn address">주소찾기</button>
							</div>
							{/* <p className="c_red">
								* <span>dasfsfsdafasd</span>
							</p> */}
						</div>
					</div>
					<div className="join-input">
						<div className="join-label">
							<label htmlFor="">상세주소</label>
							{/* <span className="c_red">*</span> */}
						</div>
						<div className="join-text">
							<div>
								<input
									type="text"
									placeholder="상세주소를 입력해주세요."
									name="address"
									value={joinForm.address}
									onChange={change_joinForm}
								/>
							</div>
							{/* <p className="c_red">
								* <span>dasfsfsdafasd</span>
							</p> */}
						</div>
					</div>

					<div className="join-input">
						<div className="join-label">
							<label htmlFor="">생년월일</label>
							{/* <span className="c_red">*</span> */}
						</div>
						<div className="join-text">
							<div>
								<input
									type="text"
									placeholder="YYYY/MM/DD"
									name="address"
									value={joinForm.address}
									onChange={change_joinForm}
								/>
							</div>
							{/* <p className="c_red">
								* <span>dasfsfsdafasd</span>
							</p> */}
						</div>
					</div>
					<div className="join-space"></div>
					<div className="join-input">
						<div className="join-label">
							<label htmlFor="">휴대폰</label>
							{/* <span className="c_red">*</span> */}
						</div>
						<div className="join-text">
							<div>
								<input
									type="tel"
									placeholder="휴대폰번호를 입력해주세요."
									name="address"
									value={joinForm.address}
									onChange={change_joinForm}
								/>
								<button className="search-btn phone">인증</button>
							</div>
							{/* <p className="c_red">
								* <span>dasfsfsdafasd</span>
							</p> */}
						</div>
					</div>
					<div className="join-input">
						<div className="join-label">
							<label htmlFor="">이메일</label>
							{/* <span className="c_red">*</span> */}
						</div>
						<div className="join-text">
							<div>
								<input
									type="email"
									placeholder="이메일을 입력해주세요."
									name="address"
									value={joinForm.address}
									onChange={change_joinForm}
								/>
							</div>
							{/* <p className="c_red">
								* <span>dasfsfsdafasd</span>
							</p> */}
						</div>
					</div>

					<div className="submit-wrap">
						<input type="submit" value={"회원가입"} />
					</div>
				</form>
			</div>
		</div>
	);
}
