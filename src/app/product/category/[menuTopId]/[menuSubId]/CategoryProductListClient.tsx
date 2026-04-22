"use client";

import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import CategoryProductListHeader from "@/app/product/category/[menuTopId]/[menuSubId]/CategoryProductListHeader";
import CategoryProductListSection from "@/app/product/category/[menuTopId]/[menuSubId]/CategoryProductListSection";
import { getApiUrl } from "@/lib/getBaseUrl";
import {
	GetProductListRequest,
	GetProductListResponse,
	ProductListCursor,
	type ProductItem as ProductItemType,
	type ProductPopularPeriodOption,
	type ProductSortOption,
} from "@/types/product";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type OptionType = {
	id: number;
	val: string;
};

// 정렬 종류 리스트
const sortOptionList: (OptionType & { code: ProductSortOption })[] = [
	{ id: 1, code: "POPULAR", val: "인기순" },
	{ id: 2, code: "LATEST", val: "최신순" },
	{ id: 3, code: "PRICE_LOW", val: "낮은 가격순" },
	{ id: 4, code: "PRICE_HIGH", val: "높은 가격순" },
];

// 인기 기간 리스트
const popularPeriodOptionList: (OptionType & { code: ProductPopularPeriodOption })[] = [
	{ id: 1, code: "DAYS_7", val: "7일" },
	{ id: 2, code: "DAYS_30", val: "30일" },
	{ id: 3, code: "YEAR_1", val: "1년" },
	{ id: 4, code: "ALL", val: "전체" },
];

interface CategoryProductListClientProps {
	initialProductListData: GetProductListResponse;
	topMenuName: string;
	subMenuName: string;
}

export default function CategoryProductListClient({ initialProductListData, topMenuName, subMenuName }: CategoryProductListClientProps) {
	// 1) [store / custom hooks] -------------------------------------------
	const params = useParams();
	const menuSubId = Number(params.menuSubId);

	// 2) [useState / useRef] ----------------------------------------------
	// 정렬 코드
	const [sortCode, setSortCode] = useState<ProductSortOption>(sortOptionList[0].code);
	// 인기 기간 코드
	const [popularPeriodCode, setPopularPeriodCode] = useState<ProductPopularPeriodOption>(popularPeriodOptionList[0].code);

	// 3) [useQuery / useMutation] -----------------------------------------

	// 제품리스트 조회 -
	const { data /* fetchNextPage, hasNextPage, isFetchingNextPage, isFetching */ } = useInfiniteQuery<
		GetProductListResponse,
		Error,
		InfiniteData<GetProductListResponse>,
		(string | number)[],
		ProductListCursor | null
	>({
		queryKey: ["productList", menuSubId, sortCode, popularPeriodCode],
		initialPageParam: null,
		queryFn: ({ pageParam }) => {
			const payload: GetProductListRequest = {
				menuSubId,
				sort: sortCode,
				popularPeriod: sortCode === "POPULAR" ? popularPeriodCode : undefined,
				...(pageParam ?? {}),
			};

			return getNormal<GetProductListResponse>(getApiUrl(API_URL.PRODUCT), { ...payload });
		},
		getNextPageParam: (lastPage) => {
			if (!lastPage.hasNext || !lastPage.nextCursor) return undefined;
			return lastPage.nextCursor;
		},
		initialData: {
			pages: [initialProductListData],
			pageParams: [null],
		},
	});

	// 4) [derived values / useMemo] ---------------------------------------
	const productList: ProductItemType[] = useMemo(() => {
		return data?.pages.flatMap((page) => page.productList) ?? [];
	}, [data]);

	// 6) [useEffect] ------------------------------------------------------
	// 정렬 코드 바뀔 때 인기 기간 초기화
	useEffect(() => {
		if (sortCode !== "POPULAR") {
			setPopularPeriodCode(popularPeriodOptionList[0].code);
		}
	}, [sortCode]);

	// 7) [UI helper values] -------------------------------------------------
	const CategoryProductListHeaderProps = {
		topMenuName,
		subMenuName,
		sortCode,
		changeSortCode: (code: ProductSortOption) => setSortCode(code),
		popularPeriodCode,
		changePopularPeriodCode: (code: ProductPopularPeriodOption) => setPopularPeriodCode(code),
		sortOptionList,
		popularPeriodOptionList,
	};

	return (
		<>
			<CategoryProductListHeader {...CategoryProductListHeaderProps} />
			<CategoryProductListSection productList={productList} />
		</>
	);
}
