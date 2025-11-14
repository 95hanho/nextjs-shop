"use client";

import styled from "@emotion/styled";

const TokenCheckButton = styled.button`
	position: fixed;
	top: 0;
	left: 0;
	background-color: #aaa;
	border: 1px solid #000;
	width: 50px;
	height: 50px;
	border-radius: 50px;
	z-index: 100000;
`;

export default function TokenCheck() {
	return (
		<>
			<TokenCheckButton>토큰확인!!</TokenCheckButton>
		</>
	);
}
