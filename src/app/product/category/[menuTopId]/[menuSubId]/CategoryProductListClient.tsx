"use client";

import CategoryProductListHeader from "@/app/product/category/[menuTopId]/[menuSubId]/CategoryProductListHeader";
import CategoryProductListSection from "@/app/product/category/[menuTopId]/[menuSubId]/CategoryProductListSection";
import type { ProductItem as ProductItemType, ProductPopularPeriodOption, ProductSortOption } from "@/types/product";
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
	productList: ProductItemType[];
	topMenuName: string;
	subMenuName: string;
}

export default function CategoryProductListClient({ productList, topMenuName, subMenuName }: CategoryProductListClientProps) {
	// 2) [useState / useRef] ----------------------------------------------
	// 정렬 코드
	const [sortCode, setSortCode] = useState<ProductSortOption>(sortOptionList[0].code);
	// 인기 기간 코드
	const [popularPeriodCode, setPopularPeriodCode] = useState<ProductPopularPeriodOption>(popularPeriodOptionList[0].code);

	// 6) [useEffect] ------------------------------------------------------
	// 정렬 코드 바뀔 때 인기 기간 초기화
	useEffect(() => {
		if (sortCode !== "POPULAR") {
			setPopularPeriodCode(popularPeriodOptionList[0].code);
		}
	}, [sortCode]);

	// 7) UI helper values -------------------------------------------------
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
