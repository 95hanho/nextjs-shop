/* 장바구니 위시버튼 */
"use client";

import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { CartItem } from "@/types/mypage";
import { useMutation } from "@tanstack/react-query";
import { MouseEvent, useState } from "react";
import { FaStar } from "react-icons/fa";
import { FiStar } from "react-icons/fi";

interface CartWishButtonProps {
	product: CartItem;
}

export default function CartWishButton({ product }: CartWishButtonProps) {
	const { user } = useAuth();
	const [wishOn, setWishOn] = useState(product.wishId !== null);

	// 위시 여부 변경
	const handleProductWish = useMutation({
		mutationFn: (productId: number) => postJson<BaseResponse>(getApiUrl(API_URL.PRODUCT_WISH), { userId: user?.userId, productId }),
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
		onSettled(a, b) {},
	});

	// 위시 선택변경
	const changeWish = (e: MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		setWishOn(!wishOn);
		handleProductWish.mutate(product.productId);
	};

	return (
		<a href="" className="product-itme__wish" onClick={changeWish}>
			{wishOn ? <FaStar /> : <FiStar />}
		</a>
	);
}
