"use client";

import styled from "@emotion/styled";
import { CircleLoader, ClipLoader } from "react-spinners";

const LodingWrapDiv = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.1);
	z-index: 100;
	display: flex;
	justify-content: center;
	align-items: center;
`;

export const LodingWrap = () => {
	return (
		<LodingWrapDiv className="loding-wrap">
			{/* <CircleLoader color="#333" size={40} /> */}
			<ClipLoader color="#494949ff" size={100} />
		</LodingWrapDiv>
	);
};
