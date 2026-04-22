"use client";

import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import CategoryProductListHeader from "@/app/product/category/[menuTopId]/[menuSubId]/CategoryProductListHeader";
import CategoryProductListSection from "@/app/product/category/[menuTopId]/[menuSubId]/CategoryProductListSection";
import { getApiUrl } from "@/lib/getBaseUrl";
import {
	GetProductListResponse,
	type ProductItem as ProductItemType,
	type ProductPopularPeriodOption,
	type ProductSortOption,
} from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

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
	// 2) [useState / useRef] ----------------------------------------------
	// 정렬 코드
	const [sortCode, setSortCode] = useState<ProductSortOption>(sortOptionList[0].code);
	// 인기 기간 코드
	const [popularPeriodCode, setPopularPeriodCode] = useState<ProductPopularPeriodOption>(popularPeriodOptionList[0].code);

	// 3) [useQuery / useMutation] -----------------------------------------

	// 제품리스트 조회 -
	const { data: productListData = initialProductListData } = useQuery<GetProductListResponse, Error>({
		queryKey: ["productList", sortCode, popularPeriodCode],
		queryFn: () => getNormal(getApiUrl(API_URL.PRODUCT), { sort: sortCode, popular: popularPeriodCode, menuSubId: 0 }), // TODO: menuSubId
		enabled: false, // 초기에는 비활성화 (SSR에서 이미 데이터 받아왔으므로)
		refetchOnWindowFocus: false,
		initialData: initialProductListData, // SSR에서 받아온 제품 리스트 초기값으로 설정
	});

	// 4) [derived values / useMemo] ---------------------------------------
	const productList: ProductItemType[] = productListData.productList;

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
