import { OptionSelector } from "@/components/ui/OptionSelector";
import { useEffect, useState } from "react";

export const memoOptionList = [
	{ id: 1, val: "문 앞에 놓아주세요" },
	{ id: 2, val: "경비실에 맡겨주세요" },
	{ id: 3, val: "부재 시 전화 주세요" },
	{ id: 4, val: "배송 전 연락 바랍니다" },
	{ id: 5, val: "직접 입력" },
];

interface DeliveryMemoSelectorProps {
	keyName?: string;
	shippingMemo: string;
	changeMemo: (memo: string, directInput: boolean) => void;
}

export const DeliveryMemoSelector = ({ keyName = "deliveryMemo", shippingMemo, changeMemo }: DeliveryMemoSelectorProps) => {
	const [memoPickidx, setMemoPickidx] = useState(0);
	const [memoOptionInit, setMemoOptionInit] = useState(memoOptionList[0]);

	useEffect(() => {
		const findIndex = memoOptionList.slice(0, 4).findIndex((v) => v.val === shippingMemo);
		if (findIndex === -1) {
			setMemoPickidx(4);
			setMemoOptionInit(memoOptionList[4]);
			changeMemo(shippingMemo, true);
		} else {
			setMemoPickidx(findIndex);
			setMemoOptionInit(memoOptionList[findIndex]);
			changeMemo(shippingMemo, false);
		}
	}, [shippingMemo, changeMemo]);

	return (
		<OptionSelector
			optionSelectorName={keyName}
			pickIdx={memoPickidx}
			initData={memoOptionInit}
			optionList={memoOptionList}
			changeOption={(idx, id) => {
				setMemoPickidx(idx);
				let memo;
				let directInput = false;
				if (id < 5) memo = memoOptionList[idx].val;
				else {
					memo = "";
					directInput = true;
				}
				changeMemo(memo, directInput);
			}}
			variant="addressModal"
		/>
	);
};
