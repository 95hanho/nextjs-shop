"use client";

import styled from "@emotion/styled";
import exampleImage from "@/images/1.jpg";

const Main = styled.main`
	display: grid;
	grid-template-columns: repeat(auto-fill, 225px);
	justify-content: center; /* 중앙 정렬 */
	min-width: 900px;
`;

const ImageContainer = styled.div`
	width: 225px;
	height: 225px;
	position: relative;
	background-color: #eee; /* 여백 색상 설정 */
`;

const Image = styled.img`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	object-fit: contain; /* 이미지가 정사각형 영역 내에 맞춰지고, 남는 공간은 여백으로 남음 */
`;

export default function Home() {
	const images = Array.from({ length: 40 }, (_, index) => (
		<ImageContainer key={index}>
			<Image src={"#"} alt={`Image ${index + 1}`} />
		</ImageContainer>
	));

	return <Main>{images}</Main>;
}
