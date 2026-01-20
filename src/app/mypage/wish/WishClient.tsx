/* 위시리스트페이지 */
"use client";

import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import useAuth from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { GetWishListResponse } from "@/types/mypage";
import { useQuery } from "@tanstack/react-query";
import OnOffButton from "@/components/ui/OnOffButton";
import ProductItem from "@/components/product/ProductItem";
import ProductGrid from "@/components/product/ProductGrid";

export default function WishClient() {
	const { loginOn } = useAuth();

	// React Query 쓰면 위시리스트 수정(추가/삭제) 후 invalidateQueries(["wishlist"])로 새로고침 처리 가능.
	// 위시리스트 조회
	const { data: wishListData, isLoading } = useQuery<GetWishListResponse>({
		queryKey: ["wishList"],
		queryFn: () => getNormal(getApiUrl(API_URL.MY_WISH)),
		enabled: loginOn,
		refetchOnWindowFocus: false,
		select: (data) => {
			console.log("-----------");
			console.log(data);
			return data;
		},
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
				{/* <div className="wish__filters">
					<OnOffButton text="세일중" checked={false} />
					<OnOffButton text="판매 중 상품만 보기" checked={true} />
				</div> */}
				{/* 상품 리스트 */}
				{/* <div className="grid grid-cols-6 gap-4 wish__list"> */}
				<ProductGrid>
					{/* 각 상품들 */}
					{wishListData?.wishlistItems.map((wishItem) => {
						return (
							<ProductItem
								key={"wishItem-" + wishItem.wishId}
								product={{
									id: wishItem.wishId,
									productId: wishItem.productId,
									filePath: wishItem.filePath || "",
									sellerName: wishItem.sellerName,
									productName: wishItem.name,
									price: wishItem.price,
									likeCount: wishItem.likeCount,
									wishCount: wishItem.wishCount,
								}}
							/>
						);
					})}
				</ProductGrid>
			</section>
		</main>
	);
}
