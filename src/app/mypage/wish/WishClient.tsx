/* 위시리스트페이지 */
"use client";

import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { useAuth } from "@/hooks/context/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { GetWishListResponse } from "@/types/mypage";
import { useQuery } from "@tanstack/react-query";
import { OnOffButton } from "@/components/ui/OnOffButton";
import { ProductItem } from "@/components/product/ProductItem";
import { ProductGrid } from "@/components/product/ProductGrid";
import styles from "./Wish.module.scss";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { useGetMenu } from "@/hooks/query/main/useGetMenu";

export default function WishClient() {
	// 1) [store / providers / custom hooks] -------------------------------------------
	const { loginOn } = useAuth();

	// 2) [useState / useRef] ----------------------------------------------
	// 세일 중 on/off
	const [saleOn, setSaleOn] = useState(false);
	// 판매 중 상품만 보기 on/off
	const [sellingOn, setSellingOn] = useState(false);
	// 필터링 subMenuId
	const [filterSubMenuId, setFilterSubMenuId] = useState<number | null>(null);

	// 3) [useQuery / useMutation] -----------------------------------------
	const { data: menuList = [] } = useGetMenu();
	// React Query 쓰면 위시리스트 수정(추가/삭제) 후 invalidateQueries(["wishlist"])로 새로고침 처리 가능.
	// 위시리스트 조회
	const { data: wishListData, isLoading } = useQuery<GetWishListResponse>({
		queryKey: ["wishList"],
		queryFn: () => getNormal(getApiUrl(API_URL.MY_WISH)),
		enabled: loginOn,
		refetchOnWindowFocus: false,
		select: (data) => {
			return data;
		},
	});

	// 4) [derived values / useMemo] ---------------------------------------
	// 서브메뉴 리스트
	const subMenuList = useMemo(() => {
		if (!wishListData) return [];
		const wishMenuSubIds = wishListData?.wishlistItems.map((wishItem) => wishItem.menuSubId) ?? [];
		const list = menuList
			.map((menu) =>
				menu.menuSubList
					.map((subMenu) => ({ ...subMenu, gender: menu.gender }))
					.filter((subMenu) => wishMenuSubIds.includes(subMenu.menuSubId)),
			)
			.flat();
		list.sort((a, b) => a.menuName.localeCompare(b.menuName));
		// 2개 이상있는 menuName 찾기
		const uniqueMenuNames = Object.entries(
			list.reduce(
				(acc, menu) => {
					if (acc[menu.menuName]) acc[menu.menuName]++;
					else acc[menu.menuName] = 1;
					return acc;
				},
				{} as Record<string, number>,
			),
		)
			.filter(([, count]: [string, number]) => count > 1)
			.map(([menuName]: [string, number]) => menuName);

		return list.map((menu) => {
			return {
				menuSubId: menu.menuSubId,
				menuName: menu.menuName + (uniqueMenuNames.includes(menu.menuName) ? ` (${menu.gender === "M" ? "남" : "여"})` : ""),
			};
		});
	}, [menuList, wishListData]);
	// 필터링 된 위시리스트
	const { wishList } = useMemo(() => {
		if (!wishListData)
			return {
				wishList: [],
			};
		let wishList = wishListData?.wishlistItems;
		/* 서브메뉴 필터링 처리 */
		if (filterSubMenuId) {
			wishList = wishList.filter((wishItem) => wishItem.menuSubId === filterSubMenuId);
		}

		/* 세일중, 판매 중 상품만 보기 필터링처리 */
		if (saleOn) {
			wishList = wishList.filter((wishItem) => wishItem.originPrice > wishItem.finalPrice);
		}
		if (sellingOn) {
			wishList = wishList.filter((wishItem) => !wishItem.saleStop);
		}

		return {
			wishList,
		};
	}, [wishListData, saleOn, sellingOn, filterSubMenuId]);

	if (isLoading) return null;
	return (
		<>
			{/* 상단 선택메뉴 */}
			<header>
				<div className="px-4 py-3 font-semibold">
					<span className="text-xl">좋아요</span>
				</div>
				<nav>
					{/* <div className="px-2 pb-3">
						<ul className={clsx(styles.tabList, styles.brandTabList)}>
							<li className="on">상품 4</li>
							<li>브랜드 2</li>
						</ul>
					</div> */}
					<div className="px-[9px] py-3 bg-gray-200">
						<ul className={clsx(styles.tabList, styles.categoryTabList)}>
							<li>
								<button className={filterSubMenuId === null ? styles.on : ""} onClick={() => setFilterSubMenuId(null)}>
									전체
								</button>
							</li>
							{subMenuList.map((subMenu) => (
								<li key={subMenu.menuSubId}>
									<button
										className={filterSubMenuId === subMenu.menuSubId ? styles.on : ""}
										onClick={() => setFilterSubMenuId(subMenu.menuSubId)}
									>
										{subMenu.menuName}
									</button>
								</li>
							))}
						</ul>
					</div>
				</nav>
			</header>
			{/* 상품들 */}
			<section>
				{/* 상품 필터 on/off 버튼 */}
				<div className="flex items-center justify-between mx-1 my-2 font-semibold">
					<span>
						<OnOffButton text="세일중" checked={saleOn} size="sm" onChange={(checked) => setSaleOn(checked)} />
						<OnOffButton text="판매 중 상품만 보기" checked={sellingOn} size="sm" onChange={(checked) => setSellingOn(checked)} />
					</span>
					<span className="mr-3 text-lg">{wishList.length}개</span>
				</div>
				{/* 상품 리스트 */}
				<ProductGrid>
					{/* 각 상품들 */}
					{wishList.map((wishItem) => {
						return (
							<ProductItem
								key={"wishItem-" + wishItem.wishId}
								product={{
									id: wishItem.wishId,
									productId: wishItem.productId,
									productImageList: wishItem.productImageList,
									sellerName: wishItem.sellerName,
									productName: wishItem.productName,
									originPrice: wishItem.originPrice,
									finalPrice: wishItem.finalPrice,
									viewCount: wishItem.viewCount,
									wishCount: wishItem.wishCount,
									soldOut: wishItem.soldOut,
									saleStop: wishItem.saleStop,
									initWish: true, // 위시리스트에서는 무조건 true라서 임의이 값 넣음
								}}
							/>
						);
					})}
				</ProductGrid>
			</section>
		</>
	);
}
