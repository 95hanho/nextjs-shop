"use client";

import "./optionSelector.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

interface OptionSelectorProps {
	optionSelectorName: string;
	initData: { id: number; val: string };
	pickIdx?: number;
	optionList?: { id: number; val: string; description?: string }[];
	changeOption?: (id: number) => void;
}

export default function OptionSelector({ optionSelectorName, initData, pickIdx = 0, optionList, changeOption }: OptionSelectorProps) {
	const optionSelectorRef = useRef<HTMLDivElement>(null);
	const [openOptionList, setOpenOptionList] = useState<boolean>(false);

	useEffect(() => {
		if (openOptionList) {
			const handleClick = (e: MouseEvent) => {
				if (
					optionSelectorRef.current &&
					!optionSelectorRef.current.contains(e.target as Node) // <- 여기 수정
				) {
					setOpenOptionList(false);
				}
			};

			document.addEventListener("click", handleClick);
			return () => {
				document.removeEventListener("click", handleClick); // ✅ 이벤트 제거도 추가!
			};
		}
	}, [openOptionList]);

	return (
		<div className="option-selector" ref={optionSelectorRef}>
			<div
				className="option-select-box"
				onClick={() => {
					if (optionList) setOpenOptionList(!openOptionList);
				}}
			>
				<input type="text" value={optionList ? optionList[pickIdx].val : initData.val} readOnly />
				<span>{openOptionList ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
			</div>
			{openOptionList && (
				<ul className="option-list">
					{optionList &&
						optionList.map((option, optionIdx) => {
							return (
								<li
									key={optionSelectorName + "-optionItem" + optionIdx}
									className={`${pickIdx === optionIdx ? "on" : ""}`}
									onClick={() => {
										if (changeOption) changeOption(option.id);
										setOpenOptionList(false);
									}}
								>
									<p>{option.val}</p>
									{option.description && <h5>{option.description}</h5>}
								</li>
							);
						})}
				</ul>
			)}
		</div>
	);
}
