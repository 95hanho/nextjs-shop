import styled from "@emotion/styled";
import { CircleLoader, ClipLoader } from "react-spinners";

const LodingWrapDiv = styled.div<{ bgColor?: string }>`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: ${(props) => props.bgColor || "rgba(0, 0, 0, 0.1)"};
	z-index: 100;
	display: flex;
	justify-content: center;
	align-items: center;
`;

interface LodingWrapProps {
	bgColor?: string;
}

export const LodingWrap = ({ bgColor }: LodingWrapProps) => {
	return (
		<LodingWrapDiv bgColor={bgColor}>
			{/* <CircleLoader color="#333" size={40} /> */}
			<ClipLoader color="#494949ff" size={100} />
		</LodingWrapDiv>
	);
};
