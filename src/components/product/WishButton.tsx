/* 장바구니 위시버튼 */

import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { FaStar } from "react-icons/fa";
import { FiStar } from "react-icons/fi";
import styled from "@emotion/styled";

const WishALink = styled.button<{ bottom: number; right: number; size: number; zIndex: number }>`
	position: absolute;
	bottom: ${(props) => props.bottom}px;
	right: ${(props) => props.right}px;
	z-index: ${(props) => props.zIndex};
	font-size: ${(props) => props.size}px;
	color: #ffe142;

	/* 아이콘 위로 올리기 */
	display: inline-flex;
	align-items: center;
	justify-content: center;

	/* 텍스트 아이콘 자체 그림자 */
	filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));

	/* 뒤에 깔리는 배경 */
	&::before {
		content: "";
		position: absolute;
		inset: -0.1px;
		border-radius: 9999px;
		background: rgb(235 231 36 / 10%);
		-webkit-backdrop-filter: blur(2px);
		-webkit-backdrop-filter: blur(2px);
		backdrop-filter: blur(2px);
		z-index: -1;
		pointer-events: none;
	}

	/* 호버 시 강조 */
	&:hover {
		color: #fd9171;
	}
	&:hover::before {
		display: none;
	}

	/* 클릭 시 눌리는 느낌 */
	&:active {
		transform: scale(0.95);
	}
`;

interface WishButtonProps {
	initWishOn: boolean;
	productId: number;
	bottom?: number;
	right?: number;
	size?: number;
	zIndex?: number;
}

export const WishButton = ({ initWishOn, productId, bottom = 1, right = 1, size = 16, zIndex = 10 }: WishButtonProps) => {
	const [wishOn, setWishOn] = useState(initWishOn);

	// 위시 여부 변경
	const handleProductWish = useMutation({
		mutationFn: () => postJson<BaseResponse>(getApiUrl(API_URL.PRODUCT_WISH), { productId }),
		// Mutation이 시작되기 직전에 특정 작업을 수행
		onMutate(a) {
			console.log(a);
		},
		onSuccess(data) {
			console.log(data);
		},
		onError(err) {
			console.log(err);
		},
		// 결과에 관계 없이 무언가 실행됨
		// onSettled(a, b) {},
	});

	// 위시 선택변경
	const changeWish = () => {
		setWishOn(!wishOn);
		handleProductWish.mutate();
	};

	const wishALinkProps = {
		bottom,
		right,
		size,
		zIndex,
	};

	return (
		<WishALink onClick={changeWish} {...wishALinkProps}>
			{wishOn ? <FaStar /> : <FiStar />}
		</WishALink>
	);
};
