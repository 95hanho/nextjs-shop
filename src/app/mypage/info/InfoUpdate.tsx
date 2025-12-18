"use client";

import useAuth from "@/hooks/useAuth";
import { FormEvent } from "@/types/auth";

export default function InfoUpdate() {
	const { user } = useAuth();

	console.log(user);

	const updateUserInfo = (e:FormEvent) => {
		e.preventDefault();


	return <div id="infoUpdate" className="user-wrapper">
		<div className="form-wrap join">
				<form onSubmit={updateUserInfo}>
					<JoinInput
						name="userId"
						label="아이디"
						placeholder="아이디를 입력해주세요."
						value={joinForm.userId}
						failMessage={joinFailAlert.userId}
						successMessage={joinSuccessAlert.userId}
						onChange={changeJoinForm}
						onBlur={validateJoinForm}
						ref={(el) => {
							joinFormRefs.current.userId = el;
						}}
					/>
					<JoinInput
						name="password"
						label="비밀번호"
						placeholder="비밀번호를 입력해주세요."
						type="password"
						value={joinForm.password}
						failMessage={joinFailAlert.password}
						onChange={changeJoinForm}
						onBlur={validateJoinForm}
						ref={(el) => {
							joinFormRefs.current.password = el;
						}}
					/>
					<JoinInput
						name="passwordCheck"
						label="비밀번호 확인"
						placeholder="비밀번호를 한 번 더 입력해주세요."
						type="password"
						value={joinForm.passwordCheck}
						failMessage={joinFailAlert.passwordCheck}
						onChange={changeJoinForm}
						onBlur={validateJoinForm}
						ref={(el) => {
							joinFormRefs.current.passwordCheck = el;
						}}
					/>
					<div className="join-space"></div>
					<JoinInput
						name="name"
						label="이름"
						placeholder="이름을 입력해주세요."
						value={joinForm.name}
						failMessage={joinFailAlert.name}
						onChange={changeJoinForm}
						onBlur={validateJoinForm}
						ref={(el) => {
							joinFormRefs.current.name = el;
						}}
					/>
					<JoinInput
						name="address"
						label="주소"
						placeholder="주소를 입력해주세요."
						value={joinForm.address}
						failMessage={joinFailAlert.address}
						readOnly
						onClick={addressPopup}
						onBlur={validateJoinForm}
						searchBtn={{ txt: "검색", fnc: addressPopup }}
					/>
					<JoinInput
						name="addressDetail"
						label="상세주소"
						placeholder="상세주소를 입력해주세요."
						value={joinForm.addressDetail}
						failMessage={joinFailAlert.addressDetail}
						onChange={changeJoinForm}
						onBlur={validateJoinForm}
						ref={(el) => {
							joinFormRefs.current.addressDetail = el;
						}}
					/>
					<JoinInput
						name="birthday"
						label="생년월일"
						placeholder="YYYY/MM/DD"
						value={joinForm.birthday}
						failMessage={joinFailAlert.birthday}
						onChange={changeJoinForm}
						onBlur={validateJoinForm}
						ref={(el) => {
							joinFormRefs.current.birthday = el;
						}}
					/>
					<div className="join-space"></div>
					<JoinInput
						name="phone"
						label="휴대폰"
						placeholder="휴대폰번호를 입력해주세요."
						type="tel"
						value={joinForm.phone}
						failMessage={joinFailAlert.phone}
						successMessage={joinSuccessAlert.phone}
						onChange={changeJoinForm}
						searchBtn={{
							txt: "인증",
							fnc: () => {
								handlePhoneAuth.mutate(joinForm.phone);
							},
						}}
						onBlur={validateJoinForm}
						ref={(el) => {
							joinFormRefs.current.phone = el;
						}}
					/>
					<JoinInput
						name="email"
						label="이메일"
						placeholder="이메일을 입력해주세요."
						type="text"
						value={joinForm.email}
						failMessage={joinFailAlert.email}
						onChange={changeJoinForm}
						onBlur={validateJoinForm}
						ref={(el) => {
							joinFormRefs.current.email = el;
						}}
					/>
					<div className="submit-wrap">
						<input type="submit" value={"회원가입"} />
					</div>
				</form>
			</div>
	</div>;
}
