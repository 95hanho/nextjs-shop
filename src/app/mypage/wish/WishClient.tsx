/* 위시리스트페이지 */
"use client";

import API_URL from "@/api/endpoints";
import { getNormal, postJson } from "@/api/fetchFilter";
import useAuth from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { GetWishListResponse } from "@/types/mypage";
import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { FaHeart, FaStar } from "react-icons/fa";
import WishButton from "./WishButton";
import ImageFill from "@/components/common/ImageFill";

export default function WishClient() {
	const { user } = useAuth();

	// React Query 쓰면 위시리스트 수정(추가/삭제) 후 invalidateQueries(["wishlist"])로 새로고침 처리 가능.
	// 위시리스트 조회
	const { data: wishListData, isLoading } = useQuery<GetWishListResponse>({
		queryKey: ["wishList", user?.userId],
		queryFn: () => getNormal(getApiUrl(API_URL.MY_WISH)),
		enabled: !!user?.userId,
	});
	// 위시 선택변경
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

	if (isLoading) return <h1>로딩중....</h1>;

	return (
		<main id="wish" className="wish">
			{/* 상단 선택메뉴 */}
			<header className="wish__header">
				<div className="wish__title">
					<span>좋아요</span>
				</div>
				<nav className="wish__nav">
					<div className="wish__tabs wish__tabs--category">
						<ul className="tab__list">
							<li className="tab__item on">상품 4</li>
							<li className="tab__item">브랜드 2</li>
						</ul>
					</div>

					<div className="wish__tabs wish__tabs--filter">
						<ul className="tab__list">
							<li className="tab__item on">전체</li>
							<li className="tab__item">신발</li>
							<li className="tab__item">바지</li>
						</ul>
					</div>
				</nav>
			</header>
			{/* 상품들 */}
			<section className="wish__content">
				{/* 상품 필터 on/off 버튼 */}
				<div className="wish__filters">
					<div className="onoff-btn-wrap">
						<input type="checkbox" id="sale-switch" name="sale" className="onf-checkbox" />
						<label htmlFor="sale-switch" className="switch-label">
							<span className="onf-btn"></span>
						</label>
						<label htmlFor="sale-switch" className="onf-txt">
							세일중
						</label>
					</div>

					<div className="onoff-btn-wrap">
						<input type="checkbox" id="selling-switch" name="selling" className="onf-checkbox" />
						<label htmlFor="selling-switch" className="switch-label">
							<span className="onf-btn"></span>
						</label>
						<label htmlFor="selling-switch" className="onf-txt">
							판매 중 상품만 보기
						</label>
					</div>
				</div>
				{/* 상품 리스트 */}
				<div className="wish__list">
					{/* 각 상품들 */}
					{wishListData?.wishlistItems.map((wishItem) => {
						return (
							<div className="wish__item" key={"wishItem-" + wishItem.wishId}>
								{/* 이미지 */}
								<div className="product__thumb">
									<ImageFill src={wishItem.filePath} fill={true} className="product__img" />
									<WishButton
										clickFnc={() => {
											handleProductWish.mutate(wishItem.productId);
										}}
									/>
								</div>
								{/* 하단 상품설명 */}
								<div className="product__info">
									<h4 className="product__brand">{wishItem.sellerName}</h4>
									<h5 className="product__name">{wishItem.name}</h5>

									<div className="product__price">
										<div aria-live="polite">
											<span className="summary__badge text-red-500 mr-1">0%</span>
											<span className="summary__price">{wishItem.price}</span>
										</div>
									</div>
									<div className="product__meta">
										<div className="meta__wish">
											<span className="meta__icon">
												<FaHeart />
											</span>
											{/* <span className="meta__count">2.0만</span> */}
											<span className="meta__count">{wishItem.likeCount}</span>
										</div>

										<div className="meta__rate">
											<span className="meta__icon">
												<FaStar />
											</span>
											{/* <span className="meta__count">4.9(6천+)</span> */}
											<span className="meta__count">{wishItem.wishCount}</span>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</section>
		</main>
	);
}
