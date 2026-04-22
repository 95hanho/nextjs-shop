import { FormInput } from "@/components/form/FormInput";
import { InfoMark } from "@/components/form/InfoMark";
import { ModalFrame } from "@/components/modal/frame/ModalFrame";
import { ChangeEvent, FormEvent } from "@/types/event";
import { FormInputAlarm, FormInputRefs } from "@/types/form";
import { AddProductOptionBase, SellerProductOption, UpdateSellerProductOptionRequest } from "@/types/seller";
import { useEffect, useRef, useState } from "react";
import styles from "../Modal.module.scss";
import clsx from "clsx";
import { FaExchangeAlt } from "react-icons/fa";
import { money } from "@/lib/format";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import { DomainModalPropsMap } from "@/store/modal.type";
import { OptionSelector } from "@/components/ui/OptionSelector";
import { ProductSize } from "@/types/product";

type SellerProductOptionModalProps = {
	onClose: () => void;
} & DomainModalPropsMap["SELLER_PRODUCT_OPTION"];

type OptionFormInputKeys = "addPrice" | "stock" | "size" /* | "displayed" */;
type OptionFormAlarm = FormInputAlarm<OptionFormInputKeys>;
type OptionFormInputRefs = FormInputRefs<OptionFormInputKeys>;

type ProducSizeInput = ProductSize | "";
const productSizeList: ProductSize[] = ["XS", "S", "M", "L", "XL", "XXL"];
const initOptionForm: Omit<Partial<SellerProductOption>, "size"> & { size: ProducSizeInput } = {
	size: "",
	addPrice: 0,
	stock: 0,
};

export const SellerProductOptionModal = ({
	onClose,
	prevSellerProductOption,
	productOptionSizeDuplicateList,
	handleAfterAddSellerProductOption,
	handleAfterUpdateSellerProductOption,
	handleAfterDeleteSellerProductOption,
}: SellerProductOptionModalProps) => {
	// 1) [store / custom hooks] -------------------------------------------
	const { openDialog } = useGlobalDialogStore();

	// 2) [useState / useRef] ----------------------------------------------
	// 옵션 입력값
	const [optionForm, setOptionForm] = useState<Omit<Partial<SellerProductOption>, "size"> & { size: ProducSizeInput }>(
		prevSellerProductOption || initOptionForm,
	);
	const [optionFormAlarm, setOptionFormAlarm] = useState<OptionFormAlarm | null>(null);
	const optionFormInputRefs = useRef<Partial<OptionFormInputRefs>>({});

	// 4) [derived values / useMemo] ---------------------------------------
	const addPossibleProductSize = productSizeList.filter((size) => !productOptionSizeDuplicateList?.includes(size));

	// 5) [handlers / useCallback] -----------------------------------------
	// optionForm 변경
	const changeOptionForm = (e: ChangeEvent) => {
		const { name, value } = e.target as {
			name: OptionFormInputKeys;
			value: string;
		};
		let changeVal = value;
		// 숫자만 허용해야하는 input은 숫자만 입력받도록
		if (["addPrice", "stock"].includes(name)) {
			changeVal = changeVal.replace(/[^0-9]/g, "");
		}

		setOptionFormAlarm(null);
		setOptionForm((prev) => ({
			...prev,
			[name]: changeVal,
		}));
	};
	// 유효성 확인 ex) 정규표현식 확인
	const validateOptionForm = async (e: ChangeEvent) => {
		const { name, value } = e.target as {
			name: OptionFormInputKeys;
			value: string;
		};
		let changeVal = value.trim();
		// let changeAlarm: OptionFormAlarm | null = null;

		// 숫자만 허용해야하는 input은 숫자만 입력받도록
		if (["addPrice", "stock"].includes(name)) {
			changeVal = changeVal.replace(/[^0-9]/g, "");
			if (changeVal && Number(changeVal) < 0) {
				changeVal = "0";
			}
		}

		if (!changeVal) return;
		// setOptionFormAlarm(changeAlarm);
		setOptionForm((prev) => ({
			...prev,
			[name]: changeVal,
		}));
	};
	// 옵션 등록/수정 제출
	const optionSetSubmit = (e: FormEvent) => {
		console.log("optionSetSubmit");
		e.preventDefault();
		// 알람이 있을 때는 해당 input으로 focus
		if (optionFormAlarm?.status === "FAIL") {
			optionFormInputRefs.current[optionFormAlarm.name]?.focus();
			return;
		}
		let changeAlarm: OptionFormAlarm | null = null;
		// const alertKeys = Object.keys(optionForm) as OptionFormInputKeys[];
		// for (const key of alertKeys) {
		// 	if (!optionFormInputRefs.current[key]) continue;
		// 	const value = optionForm[key];
		// 	// 알람없을 때 처음 누를 때
		// 	if (!value) {
		// 		changeAlarm = { name: key, message: "해당 내용을 입력해주세요.", status: "FAIL" };
		// 	}
		// 	if (changeAlarm) break;
		// }

		// 사이즈만 빈 값 확인
		if (optionForm.size === "") {
			changeAlarm = { name: "size", message: "사이즈를 입력해주세요.", status: "FAIL" };
		}

		if (changeAlarm) {
			setOptionFormAlarm(changeAlarm);
			optionFormInputRefs.current[changeAlarm.name]?.focus();
			return;
		}
		// productOptionId가 없으면 등록, 있으면 수정
		if (!optionForm.productOptionId) {
			const addProductOption: AddProductOptionBase = {
				addPrice: optionForm.addPrice,
				stock: optionForm.stock,
				size: optionForm.size,
			} as AddProductOptionBase;
			handleAfterAddSellerProductOption?.(addProductOption);
			onClose();
		} else {
			const updateProductOption: UpdateSellerProductOptionRequest = {
				productOptionId: optionForm.productOptionId,
				addPrice: optionForm.addPrice,
				stock: optionForm.stock,
				isDisplayed: optionForm.displayed || false,
			} as UpdateSellerProductOptionRequest;
			handleAfterUpdateSellerProductOption?.(updateProductOption);
			onClose();
		}
	};

	// 6) [useEffect] ------------------------------------------------------
	useEffect(() => {
		console.log({ prevSellerProductOption });
	}, [prevSellerProductOption]);

	return (
		<ModalFrame title={!prevSellerProductOption ? "옵션 추가" : "옵션 수정"} onClose={onClose}>
			<form onSubmit={optionSetSubmit} className={clsx(styles.settingForm, styles.optionForm)}>
				{!prevSellerProductOption ? (
					<InfoMark
						title="사이즈"
						noMargin
						infoVal={
							<span className={styles.optionSizeSelector}>
								<OptionSelector
									pickIdx={optionForm.size ? addPossibleProductSize.findIndex((v) => v === optionForm.size) + 1 : 0}
									initData={{ id: 0, val: "사이즈를 입력해주세요." }}
									optionSelectorName="sellerProductOptionSize"
									optionList={[
										{ id: 0, val: "사이즈를 입력해주세요." },
										...addPossibleProductSize.map((v, i) => ({ id: i + 1, val: v })),
									]}
									changeOption={(_, id) => {
										setOptionForm((prev) => ({
											...prev,
											size: addPossibleProductSize[id - 1],
										}));
									}}
									ref={(el) => {
										optionFormInputRefs.current.size = el;
									}}
								/>
								{optionFormAlarm?.status === "FAIL" && optionFormAlarm.name === "size" && (
									<p className="text-red-500">* {optionFormAlarm.message}</p>
								)}
							</span>
						}
					/>
				) : (
					<InfoMark title="사이즈" infoVal={<span>{optionForm.size}</span>} />
				)}
				<FormInput
					label="추가 요금"
					name="addPrice"
					value={money(optionForm.addPrice || 0)}
					placeholder=""
					onChange={changeOptionForm}
					onBlur={validateOptionForm}
					alarm={optionFormAlarm}
					ref={(el) => {
						optionFormInputRefs.current.addPrice = el;
					}}
					unit="원"
				/>
				<FormInput
					label="재고 수량"
					type="number"
					name="stock"
					value={optionForm.stock || 0}
					placeholder=""
					onChange={changeOptionForm}
					onBlur={validateOptionForm}
					alarm={optionFormAlarm}
					ref={(el) => {
						optionFormInputRefs.current.stock = el;
					}}
				/>
				{prevSellerProductOption && (
					<>
						<InfoMark
							title="숨김 상태"
							infoVal={
								<span className={clsx(!optionForm.displayed && styles.off)}>
									{optionForm.displayed ? "표시" : "숨김"}
									<button
										type="button"
										className={clsx(styles.changeButton)}
										onClick={() => {
											setOptionForm({
												...optionForm,
												displayed: !optionForm.displayed,
											});
										}}
									>
										<FaExchangeAlt />
									</button>
								</span>
							}
						/>
						<InfoMark
							title="삭제"
							infoVal={
								<button
									type="button"
									className={styles.deleteButton}
									onClick={() => {
										openDialog("CONFIRM", {
											content: "옵션을 삭제하시겠습니까?",
											handleAfterOk: () => {
												handleAfterDeleteSellerProductOption?.(prevSellerProductOption?.productOptionId);
												onClose();
											},
										});
									}}
								>
									삭제하기
								</button>
							}
						/>
					</>
				)}
				{/* 버튼 */}
				<div className={styles.optionActions}>
					<button type="button" onClick={onClose}>
						취소
					</button>
					<button type="submit">완료</button>
				</div>
			</form>
		</ModalFrame>
	);
};
