import { OptionSelector } from "@/components/ui/OptionSelector";
import { ProductPopularPeriodOption, ProductSortOption } from "@/types/product";

type OptionType = {
	id: number;
	val: string;
};

interface CategoryProductListHeaderProps {
	topMenuName: string;
	subMenuName: string;
	sortCode: ProductSortOption;
	changeSortCode: (code: ProductSortOption) => void;
	popularPeriodCode: ProductPopularPeriodOption;
	changePopularPeriodCode: (code: ProductPopularPeriodOption) => void;
	sortOptionList: (OptionType & { code: ProductSortOption })[];
	popularPeriodOptionList: (OptionType & { code: ProductPopularPeriodOption })[];
}

export default function CategoryProductListHeader({
	topMenuName,
	subMenuName,
	sortCode,
	changeSortCode,
	popularPeriodCode,
	changePopularPeriodCode,
	sortOptionList,
	popularPeriodOptionList,
}: CategoryProductListHeaderProps) {
	return (
		<header>
			<h2 className="flex justify-between px-3 my-2 tracking-wide">
				<span>
					{topMenuName}-{subMenuName}
				</span>
				<span className="relative inline-flex items-center text-xs font-normal">
					{sortCode === "POPULAR" && (
						<span className="w-[80px]">
							<OptionSelector
								initData={{
									id: 1,
									val: "7일",
								}}
								pickIdx={popularPeriodOptionList.findIndex((option) => option.code === popularPeriodCode)}
								optionSelectorName="popularPeriodOption"
								optionList={popularPeriodOptionList}
								changeOption={(idx) => {
									changePopularPeriodCode(popularPeriodOptionList[idx].code);
								}}
							/>
						</span>
					)}
					<span className="w-[120px] ml-2">
						<OptionSelector
							initData={{
								id: 1,
								val: "인기순",
							}}
							pickIdx={sortOptionList.findIndex((option) => option.code === sortCode)}
							optionSelectorName="sortOption"
							optionList={sortOptionList}
							changeOption={(idx) => {
								changeSortCode(sortOptionList[idx].code);
							}}
						/>
					</span>
				</span>
			</h2>
		</header>
	);
}
