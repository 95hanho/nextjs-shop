import { OptionSelector } from "@/components/ui/OptionSelector";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
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
	// 1) [store / custom hooks] -------------------------------------------
	const { openDialog } = useGlobalDialogStore();

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
									id: 4,
									val: "ALL",
								}}
								pickIdx={popularPeriodOptionList.findIndex((option) => option.code === popularPeriodCode)}
								optionSelectorName="popularPeriodOption"
								optionList={popularPeriodOptionList}
								changeOption={(idx) => {
									changePopularPeriodCode(popularPeriodOptionList[idx].code);
									openDialog("ALERT", {
										content: "포트폴리오용으로 인기 기간은 전체로 고정되어 있습니다.",
									});
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
