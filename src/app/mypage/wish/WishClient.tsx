/* 위시리스트페이지 */
"use client";

import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { GetWishListResponse } from "@/types/mypage";
import { useQuery } from "@tanstack/react-query";
import { OnOffButton } from "@/components/ui/OnOffButton";
import { ProductItem } from "@/components/product/ProductItem";
import { ProductGrid } from "@/components/product/ProductGrid";
import styles from "./WishClient.module.scss";
import clsx from "clsx";

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
		<>
			{/* 상단 선택메뉴 */}
			<header>
				<div className="px-4 py-3 font-semibold">
					<span className="text-xl">좋아요</span>
				</div>
				<nav>
					<div className="px-2 pb-3">
						<ul className={clsx(styles.tabList, styles.brandTabList)}>
							<li className="on">상품 4</li>
							<li>브랜드 2</li>
						</ul>
					</div>

					<div className="px-[9px] py-3 bg-gray-200">
						<ul className={clsx(styles.tabList, styles.categoryTabList)}>
							<li className="on">전체</li>
							<li>신발</li>
							<li>바지</li>
						</ul>
					</div>
				</nav>
			</header>
			{/* 상품들 */}
			<section>
				{/* 상품 필터 on/off 버튼 */}
				{/* <div className="wish__filters">
					<OnOffButton text="세일중" checked={false} />
					<OnOffButton text="판매 중 상품만 보기" checked={true} />
				</div> */}
				{/* 상품 리스트 */}
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
									originPrice: wishItem.originPrice,
									finalPrice: wishItem.finalPrice,
									likeCount: wishItem.likeCount,
									wishCount: wishItem.wishCount,
								}}
							/>
						);
					})}
				</ProductGrid>
			</section>
		</>
	);
}
