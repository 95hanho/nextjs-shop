import { OptionSelector } from "@/components/ui/OptionSelector";

export const DeliveryMemoSelector = () => {
	return (
		<OptionSelector
			optionSelectorName="deliveryMemo"
			pickIdx={memoPickidx}
			initData={memoOptionInit}
			optionList={memoOptionList}
			changeOption={(idx, id) => {
				setMemoPickidx(idx);
				let memo;
				if (id < 5) memo = memoOptionList[idx].val;
				else memo = "";
				setAddressForm((prev) => ({
					...prev,
					memo,
				}));
				setAddressFormAlarm(null);
			}}
			variant="addressModal"
		/>
	);
};
