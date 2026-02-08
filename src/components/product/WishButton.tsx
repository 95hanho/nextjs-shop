/* 장바구니 위시버튼 */

import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { useMutation } from "@tanstack/react-query";
import { MouseEvent, useState } from "react";
import { FaStar } from "react-icons/fa";
import { FiStar } from "react-icons/fi";

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
	const changeWish = (e: MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		setWishOn(!wishOn);
		handleProductWish.mutate();
	};

	return (
		<a href="" className={`absolute z-${zIndex} bottom-${bottom} right-${right} text-[#e79278] text-[${size}px] `} onClick={changeWish}>
			{wishOn ? <FaStar /> : <FiStar />}
		</a>
	);
};
